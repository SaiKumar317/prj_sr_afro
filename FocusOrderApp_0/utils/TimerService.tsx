class TimerService {
  private _timerId: NodeJS.Timer | null = null;

  stopTimer = () => {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  };

  startTimer = (cb: () => void) => {
    if (!this._timerId) {
      this._timerId = setInterval(cb, 1000);
    }
  };
}

export default TimerService;
