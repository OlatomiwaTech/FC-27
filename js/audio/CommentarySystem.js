/**
 * FC 27 - Broadcast Sports Commentary & Stadium Announcer Engine
 * Features real-time procedural speech synthesis using Web Speech API,
 * authentic sports commentator enthusiasm, cadence modulation, and stadium PA reverb.
 */

export class CommentarySystem {
  constructor(soundSystem) {
    this.sound = soundSystem;
    this.synth = window.speechSynthesis || null;
    this.voice = null;
    this.enabled = true;
    this.lastSpokenTime = 0;
    this.queue = [];
    this.isSpeaking = false;

    this.initVoice();
  }

  initVoice() {
    if (!this.synth) return;

    const findBestVoice = () => {
      const voices = this.synth.getVoices();
      // Prefer energetic English male/female broadcast voices (e.g., Natural, Google UK English, Daniel, David, Oliver)
      this.voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('UK') || v.name.includes('Online') || v.name.includes('Male')))
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];
    };

    findBestVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = findBestVoice;
    }
  }

  speak(text, priority = 'normal', rate = 1.05, pitch = 1.05) {
    if (!this.enabled || !this.synth) return;

    const now = performance.now();
    // Prevent overlapping spam on low-priority lines
    if (priority === 'normal' && (now - this.lastSpokenTime < 2500 || this.isSpeaking)) {
      return;
    }

    if (priority === 'high') {
      this.synth.cancel(); // Interrupt normal speech for GOAL or huge saves
    }

    try {
      const utter = new SpeechSynthesisUtterance(text);
      if (this.voice) utter.voice = this.voice;
      utter.rate = rate;
      utter.pitch = pitch;
      utter.volume = 1.0;

      this.isSpeaking = true;
      this.lastSpokenTime = now;

      utter.onend = () => {
        this.isSpeaking = false;
      };
      utter.onerror = () => {
        this.isSpeaking = false;
      };

      this.synth.speak(utter);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  // Authentic Broadcast Commentary Scenarios
  commentIntro(homeName, awayName, stadiumName) {
    const lines = [
      `A warm welcome under the stadium floodlights at ${stadiumName}! Today, ${homeName} face off against ${awayName}. The crowd is buzzing!`,
      `Live from ${stadiumName}, it's ${homeName} versus ${awayName}! Both starting elevens are primed for kick-off.`,
      `The atmosphere is electric here at ${stadiumName}. ${homeName} and ${awayName} are on the pitch, and we are ready for the opening whistle!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.05, 1.0);
  }

  commentPass(playerName) {
    const lines = [
      `${playerName} moves the ball forward cleanly.`,
      `Finding space in midfield, lovely distribution from ${playerName}.`,
      `Good vision, threading it into open space!`,
      `Crisp pass finding the runner on the move.`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.1, 1.02);
  }

  commentThroughBall(playerName) {
    const lines = [
      `Superb through ball from ${playerName}! The defense is unlocked!`,
      `He slips it through the backline! A golden opportunity!`,
      `Weighted to perfection behind the defenders!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.15, 1.08);
  }

  commentCross(playerName) {
    const lines = [
      `Whipping the cross into the penalty box!`,
      `High ball delivered towards the far post!`,
      `Chipping it over the defense, who can get on the end of this?`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.12, 1.05);
  }

  commentShot(playerName, power) {
    if (power > 0.7) {
      const lines = [
        `HE UNLEASHES A ROCKET!`,
        `${playerName.toUpperCase()} STRIKES IT WITH IMMENSE POWER!`,
        `LOOK AT THAT STRIKE FROM DISTANCE!`
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.2, 1.15);
    } else {
      const lines = [
        `${playerName} takes the shot!`,
        `Fires towards the corner!`,
        `Testing the keeper with a low driven shot!`
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.15, 1.05);
    }
  }

  commentGoal(teamName, scorerName) {
    const lines = [
      `GOOOOOAL! SENSATIONAL FINISH BY ${scorerName.toUpperCase()}! THE NET BULGES!`,
      `IT'S IN THE BACK OF THE NET! A MAGNIFICENT GOAL FOR ${teamName.toUpperCase()}!`,
      `WHAT AN UNBELIEVABLE STRIKE! ${scorerName.toUpperCase()} SENDS THE STADIUM INTO DELIRIUM!`,
      `GOAL! PURE FOOTBALL PERFECTION! YOU CANNOT STOP THOSE!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.15, 1.2);
  }

  commentSave(gkName) {
    const lines = [
      `WHAT A REFLEX SAVE BY THE GOALKEEPER!`,
      `DENIED! ${gkName.toUpperCase()} DIVES ACROSS HIS GOAL TO PUSH IT WIDE!`,
      `BRILLIANT GOALKEEPING! HE PRESERVES HIS CLEAN SHEET WITH A CAT-LIKE STOP!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.18, 1.15);
  }

  commentWoodwork() {
    const lines = [
      `OFF THE WOODWORK! INCHES AWAY FROM A GLORIOUS GOAL!`,
      `CRASHING OFF THE CROSSBAR! THE KEEPER WAS STRANDED!`,
      `DENIED BY THE POST! WHAT DRAMA ON THE PITCH!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.2, 1.18);
  }

  commentTackle(playerName) {
    const lines = [
      `Crisp tackle won by ${playerName}!`,
      `Brilliant sliding challenge to dispossess the attacker!`,
      `Clean ball recovery in the defensive third.`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.1, 1.0);
  }

  commentHalfTime(homeScore, awayScore) {
    this.speak(`And that's the half-time whistle! The scoreline stands at ${homeScore} to ${awayScore}. Both sides head to the dressing rooms.`, 'high', 1.05, 1.0);
  }

  commentFullTime(winnerName, homeScore, awayScore) {
    if (homeScore === awayScore) {
      this.speak(`The full-time whistle sounds! A dramatic draw, ending ${homeScore} all. What an exhilarating match!`, 'high', 1.05, 1.05);
    } else {
      this.speak(`It's all over! The final whistle blows and ${winnerName} take the victory with a ${homeScore} to ${awayScore} scoreline!`, 'high', 1.08, 1.08);
    }
  }
}
