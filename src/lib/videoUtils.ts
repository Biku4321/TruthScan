/**
 * Extract multiple evenly-spaced frames from a video file.
 * Returns an array of base64 JPEG data URLs.
 */
export const extractMultipleFrames = (
  videoFile: File,
  frameCount: number = 6
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Video processing timed out."));
    }, 30000);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const fileURL = URL.createObjectURL(videoFile);
    video.src = fileURL;

    const frames: string[] = [];

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || duration === Infinity) {
        clearTimeout(timeout);
        URL.revokeObjectURL(fileURL);
        reject(new Error("Could not determine video duration."));
        return;
      }

      // Evenly space seek times: skip first 5% and last 5% to avoid black frames
      const seekTimes: number[] = [];
      for (let i = 0; i < frameCount; i++) {
        const t = duration * (0.05 + (0.9 * i) / Math.max(frameCount - 1, 1));
        seekTimes.push(Math.min(t, duration - 0.1));
      }

      let currentSeekIndex = 0;

      const captureFrame = () => {
        if (currentSeekIndex >= seekTimes.length) {
          clearTimeout(timeout);
          URL.revokeObjectURL(fileURL);
          resolve(frames);
          return;
        }
        video.currentTime = seekTimes[currentSeekIndex];
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          // Cap resolution to avoid oversized payloads
          const maxDim = 640;
          const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);

          const ctx = canvas.getContext("2d");
          if (!ctx) { currentSeekIndex++; captureFrame(); return; }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL("image/jpeg", 0.85));
          currentSeekIndex++;
          captureFrame();
        } catch {
          currentSeekIndex++;
          captureFrame();
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(fileURL);
        reject(new Error("Failed to load video for frame extraction."));
      };

      captureFrame();
    };

    video.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Failed to load video file."));
    };
  });
};

export const extractFrameFromVideo = (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // FIX: Add a 10-second timeout so the promise never hangs forever
    const timeout = setTimeout(() => {
      reject(new Error("Video processing timed out. Try a shorter clip."));
    }, 10000);

    // 1. Create a hidden video element
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    // 2. Create a URL for the file
    const fileURL = URL.createObjectURL(videoFile);
    video.src = fileURL;

    // 3. When video metadata loads (we know dimensions and duration)
    video.onloadedmetadata = () => {
      // FIX: For very short videos (< 1s), seeking to 1s gives a blank frame.
      // Seek to 10% of duration, or 1 second, whichever is smaller.
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    // 4. When we have data at that timestamp
    video.onseeked = () => {
      clearTimeout(timeout); // FIX: Cancel timeout on success
      try {
        // Create canvas to draw the frame
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            reject(new Error("Canvas context failed"));
            return;
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to Base64 Image URL
        const imageUrl = canvas.toDataURL("image/jpeg", 0.9);
        
        // Clean up
        URL.revokeObjectURL(fileURL);
        resolve(imageUrl);
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => {
      clearTimeout(timeout); // FIX: Cancel timeout on error too
      reject(new Error("Failed to load video"));
    };
  });
};