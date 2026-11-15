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
    this.lastLine = '';
    this.queue = [];
    this.isSpeaking = false;
    this.onLine = null;

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
    if (!this.enabled) return;

    const now = performance.now();
    // Prevent overlapping spam on low-priority lines
    if (priority === 'normal' && (now - this.lastSpokenTime < 2500 || this.isSpeaking)) {
      return;
    }

    this.lastSpokenTime = now;
    this.lastLine = text;
    if (this.onLine) this.onLine(text);
    if (!this.synth) return;

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

  commentFoul(playerName, isYellow = false) {
    if (isYellow) {
      const lines = [
        `YELLOW CARD! ${playerName.toUpperCase()} goes into the book!`,
        `The referee shows a yellow card to ${playerName}!`,
        `CAUTION! ${playerName.toUpperCase()} gets a warning!`
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.15, 1.1);
    } else {
      const lines = [
        `FOUL! ${playerName.toUpperCase()} brings down the opponent!`,
        `The referee blows for a foul by ${playerName}!`,
        `Clumsy challenge from ${playerName}!`
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.12, 1.05);
    }
  }

  commentCorner(teamName) {
    const lines = [
      `Corner kick for ${teamName}!`,
      `${teamName} win a corner!`,
      `Flag up! Corner to ${teamName}!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.1, 1.0);
  }

  commentOffside(teamName) {
    const lines = [
      `OFFSIDE! Against ${teamName}!`,
      `The linesman's flag is up! Offside ${teamName}!`,
      `Marginal offside call against ${teamName}!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.15, 1.08);
  }

  commentPenalty(teamName) {
    const lines = [
      `PENALTY TO ${teamName.toUpperCase()}!`,
      `What a decision! Penalty kick for ${teamName}!`,
      `The referee points to the spot! ${teamName} have a penalty!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.12, 1.12);
  }

  commentPenaltyMiss(gkName) {
    const lines = [
      `SAVED! ${gkName.toUpperCase()} DENIES THE PENALTY!`,
      `WHAT A SAVE! The goalkeeper keeps it out!`,
      `PENALTY MISSED! ${gkName.toUpperCase()} is the hero!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.18, 1.15);
  }

  commentPenaltyScore(scorerName) {
    const lines = [
      `GOAL! PENALTY CONVERTED BY ${scorerName.toUpperCase()}!`,
      `Cool as you like! ${scorerName.toUpperCase()} slots it home!`,
      `NO CHANCE FOR THE KEEPER! ${scorerName.toUpperCase()} SCORES FROM THE SPOT!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.15, 1.2);
  }

  commentSubstitution(playerName, subName) {
    const lines = [
      `Substitution: ${playerName} makes way for ${subName}!`,
      `Here comes ${subName} to replace ${playerName}!`,
      `Tactical change: ${subName} on, ${playerName} off!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.08, 1.0);
  }

  commentInjury(playerName) {
    const lines = [
      `Oh dear! ${playerName} is down injured!`,
      `${playerName} is receiving treatment on the pitch!`,
      `Medical attention needed for ${playerName}!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.08, 1.02);
  }

  commentOwnGoal(teamName, playerName) {
    const lines = [
      `OH NO! OWN GOAL BY ${teamName.toUpperCase()}!`,
      `UNBELIEVABLE! ${playerName.toUpperCase()} puts it into his own net!`,
      `What a tragedy! ${teamName.toUpperCase()} score against themselves!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.15, 1.18);
  }

  commentGreatSave(gkName, isSpectacular = false) {
    if (isSpectacular) {
      const lines = [
        `WORLD CLASS SAVE BY ${gkName.toUpperCase()}!`,
        `INCREDIBLE REFLEXES! ${gkName.toUpperCase()} DENIES A CERTAIN GOAL!`,
        `HOW DID HE KEEP THAT OUT?! ${gkName.toUpperCase()} with a miracle save!`
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.2, 1.2);
    } else {
      const lines = [
        `Good save by ${gkName}!`,
        `${gkName.toUpperCase()} gets down well to stop that!`,
        `The goalkeeper claims the ball!`
      ];
      this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.12, 1.05);
    }
  }

  commentHeader(playerName) {
    const lines = [
      `${playerName.toUpperCase()} goes for the header!`,
      `Powerful header from ${playerName}!`,
      `${playerName} rises highest!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.15, 1.08);
  }

  commentVolley(playerName) {
    const lines = [
      `ACROBATIC VOLLEY FROM ${playerName.toUpperCase()}!`,
      `${playerName} tries the bicycle kick!`,
      `Spectacular attempt! ${playerName} with a scissor kick!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.18, 1.15);
  }

  commentDribble(playerName) {
    const lines = [
      `${playerName} takes on the defender!`,
      `Skillful dribbling from ${playerName}!`,
      `${playerName} with a mazy run!`,
      `He's past one, past two! ${playerName} on a solo run!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.12, 1.05);
  }

  commentGoalkeeperAction(gkName) {
    const lines = [
      `You're now controlling the goalkeeper, ${gkName}!`,
      `${gkName} between the sticks!`,
      `The last line of defense: ${gkName}!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.08, 1.0);
  }

  commentGoalkeeperSave(gkName) {
    const lines = [
      `SAVE! ${gkName.toUpperCase()} with a brilliant stop!`,
      `DENIED! ${gkName.toUpperCase()} keeps his team in it!`,
      `BRILLIANT GOALKEEPING from ${gkName.toUpperCase()}!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'high', 1.18, 1.15);
  }

  commentGoalkeeperCatch(gkName) {
    const lines = [
      `${gkName.toUpperCase()} claims the ball confidently!`,
      `Safe hands from ${gkName}!`,
      `${gkName} catches it cleanly!`
    ];
    this.speak(lines[Math.floor(Math.random() * lines.length)], 'normal', 1.12, 1.05);
  }
}
