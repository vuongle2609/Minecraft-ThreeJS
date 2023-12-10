import { $$ } from "@/UI/utils/selector";

export default class SoundManager {
  soundsBackground = {
    mainScreen: new Audio("assets/sound/main_screen.mp3"),
    mice_on_venus: new Audio("assets/sound/mice_on_venus.mp3"),
  };
  
  currentActiveTheme: keyof typeof this.soundsBackground | null = null;

  clickSound = new Audio("assets/sound/button_click.mp3");

  addButtonClick() {
    $$("button").forEach((button) => {
      button.addEventListener("click", () => {
        this.clickSound.pause();
        this.clickSound.currentTime = 0;
        this.clickSound.play();
      });
    });
  }

  changeActiveTheme(key: keyof typeof this.soundsBackground) {
    if (key === this.currentActiveTheme) return;

    const currentKey = this
      .currentActiveTheme as unknown as keyof typeof this.soundsBackground;

    if (this.soundsBackground[currentKey]) {
      this.soundsBackground[currentKey].pause();
      this.soundsBackground[currentKey].currentTime = 0;
    }

    this.currentActiveTheme = key;

    this.soundsBackground[this.currentActiveTheme].play();
  }
}
