import { pipeline, env } from "@xenova/transformers";

// Skip local model checks (since we run in browser)
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
  static task = 'image-classification';
  static model = 'Xenova/vit-base-patch16-224'; // Vision Transformer (runs in browser!)
  static instance: any = null;

  static async getInstance(progressCallback: any = null) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback: progressCallback });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event: any) => {
  const { image } = event.data;

  // 1. Load Model
  const classifier = await PipelineSingleton.getInstance((x: any) => {
    // Send loading progress back
    if(x.status === 'progress') {
        self.postMessage({ status: 'progress', progress: x.progress });
    }
  });

  // 2. Run Classification
  const output = await classifier(image);

  // 3. Send Result
  self.postMessage({
    status: 'done',
    output: output
  });
});