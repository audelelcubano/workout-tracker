<<<<<<< Updated upstream
export type TimerCallback = (seconds: number) => void;

export class Timer {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private seconds: number = 0;
  private callback?: TimerCallback;

  constructor(initialSeconds = 0, callback?: TimerCallback) {
    this.seconds = initialSeconds;
    this.callback = callback;
  }

  start() {
    if (this.intervalId) return; // already running
    this.intervalId = setInterval(() => {
      this.seconds += 1;
      if (this.callback) this.callback(this.seconds);
    }, 1000);
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.pause();
    this.seconds = 0;
    if (this.callback) this.callback(this.seconds);
  }

  getTime() {
    return this.seconds;
  }

  setCallback(callback: TimerCallback) {
    this.callback = callback;
  }
}
=======
export type TimerCallback = (seconds: number) => void;

export class Timer {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private seconds: number = 0;
  private callback?: TimerCallback;

  constructor(initialSeconds = 0, callback?: TimerCallback) {
    this.seconds = initialSeconds;
    this.callback = callback;
  }

  start() {
    if (this.intervalId) return; // already running
    this.intervalId = setInterval(() => {
      this.seconds += 1;
      if (this.callback) this.callback(this.seconds);
    }, 1000);
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.pause();
    this.seconds = 0;
    if (this.callback) this.callback(this.seconds);
  }

  getTime() {
    return this.seconds;
  }

  setCallback(callback: TimerCallback) {
    this.callback = callback;
  }
}
>>>>>>> Stashed changes
