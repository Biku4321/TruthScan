import { pipeline, env, type PipelineType } from "@xenova/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
  static task: PipelineType = "image-classification";
  static model = "Xenova/vit-base-patch16-224"; // Vision Transformer (runs in browser)
  static instance: any = null;

  static async getInstance(progressCallback: any = null) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, {
        progress_callback: progressCallback,
      });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (event: any) => {
  const { image } = event.data;

  // 1. Load model (sends progress updates while downloading)
  const classifier = await PipelineSingleton.getInstance((x: any) => {
    if (x.status === "progress") {
      self.postMessage({ status: "progress", progress: x.progress });
    }
  });

  // 2. Run classification
  const output = await classifier(image);

  // 3. Send result back to main thread
  self.postMessage({ status: "done", output });
});