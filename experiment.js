/* create timeline */
var timeline = [];

if (! Debug) {
  // full screen
  timeline.push({
    type: 'fullscreen',
    message: '<div class="instructions"><p>Welcome to the experiment.</p><p>Press the button below to begin in full screen mode.</p></div>',
    fullscreen_mode: true
  });
}

/* learning */

var learn_instructions = {
  type: "html-keyboard-response",
  stimulus: "<p>In this part of the experiment, you will see a dot on a coloured screen.</p>" +
      "<p>Move the dot to the left or right as fast as you can to win rewards.</p>" +
      "<p>Press any key to begin.</p>",
  post_trial_gap: 2000
};
timeline.push(learn_instructions);

var iti = {
  type: 'html-keyboard-response',
  stimulus: '<div></div>',
  choices: jsPsych.NO_KEYS,
  trial_duration: function(){
    return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
  }
};

var correct_outcome = {
  type: 'image-keyboard-response',
  stimulus: jsPsych.timelineVariable('outcome'),
  prompt: jsPsych.timelineVariable('prompt'),
  choices: jsPsych.NO_KEYS,
  trial_duration: 3000,
  data: {test_part: 'outcome'}
};

var if_correct = {
  timeline: [correct_outcome],
  conditional_function: function(){
      // check response accuracy from previous trial
      var data = jsPsych.data.get().last(1).values()[0];
      if(data.correct){
          return true;
      } else {
          return false;
      }
  }
};

var incorrect_outcome = {
  type: 'image-keyboard-response',
  stimulus: 'img/incorrect.jpg',
  prompt: '<div>You earned no points</div>',
  choices: jsPsych.NO_KEYS,
  trial_duration: 3000,
  data: {test_part: 'outcome'}
};

var if_incorrect = {
  timeline: [incorrect_outcome],
  conditional_function: function(){
      // check response accuracy from previous trial
      var data = jsPsych.data.get().last(2).values()[0];
      if(! data.correct){
          return true;
      } else {
          return false;
      }
  }
};

// FIXME: parameterize for counterbalancing
var s1 = s1 || 'blue';
var s2 = s2 || 'orange';
var o1 = o1 || 'crisp';
var o2 = o2 || 'chocolate';
var r1 = r1 || 'right';
var r2 = r2 || 'left';

var learn_stimuli = [
  {
    stimulus: "<div class='prime-a'></div>",
    background: s1,
    foreground: 'white',
    outcome: 'img/' + o1 + '.jpg',
    prompt: '<div>You earned 1 ' + o1 + ' point</div>',
    data: { test_part: 'test', correct_response: r1 }
  },
  {
    stimulus: "<div class='prime-b'></div>",
    background: s2,
    foreground: 'white',
    outcome: 'img/' + o2 + '.jpg',
    prompt: '<div>You earned 1 ' + o2 + ' point</div>',
    data: { test_part: 'test', correct_response: r2 }
  }
];

var learn = {
  type: 'html-mouse-response',
  stimulus: jsPsych.timelineVariable('stimulus'),
  background: jsPsych.timelineVariable('background'),
  data: jsPsych.timelineVariable('data'),
  on_load: function() {
    $(document.body).css({'background': this.background});
  },
  on_finish: function(data){
    $(document.body).css({'background': 'white'});
    data.correct = data.direction == data.correct_response
  },
};

var learn_procedure = {
  timeline: [learn, if_correct, if_incorrect, iti],
  timeline_variables: learn_stimuli,
  sample: {
    type: 'fixed-repetitions',
    size: 5
  }
};
if (! Debug) timeline.push(learn_procedure);

/* test */

var test_instructions = {
  type: "html-keyboard-response",
  stimulus: "<p>In this part of the experiment, you will see a picture of either " + o1 + ' or ' + o2 +
      " for a few seconds.</p><p>When you see a dot on a coloured screen, if you saw <strong>" + o1 + "</strong>, " +
      "move the dot to the <strong>" + r1 + "</strong> as fast as you can, or " +
      "if you saw <strong>" + o2 + "</strong>, move the dot to the <strong>" + r2 + "</strong> as fast as you can.</p>" +
      "<p>Press any key to begin.</p>",
  post_trial_gap: 2000
};
timeline.push(test_instructions);

var test_delay = {
  type: 'html-keyboard-response',
  stimulus: jsPsych.timelineVariable('delay_prompt'),
  choices: jsPsych.NO_KEYS,
  trial_duration: 2500,
  data: jsPsych.timelineVariable('data')
};
var test_outcome = {
  type: 'image-keyboard-response',
  stimulus: jsPsych.timelineVariable('outcome'),
  //prompt: jsPsych.timelineVariable('prompt'),
  choices: jsPsych.NO_KEYS,
  trial_duration: 3000,
  data: jsPsych.timelineVariable('data')
};
var test_distraction = {
  type: 'html-keyboard-response',
  stimulus: '<div></div>',
  choices: jsPsych.NO_KEYS,
  trial_duration: jsPsych.timelineVariable('delay'),
  data: jsPsych.timelineVariable('data')
};
var test_response = {
  type: "html-mouse-response",
  stimulus: '<div></div>',
  trial_duration: 4000,
  background: jsPsych.timelineVariable('cue'),
  foreground: 'white',
  data: jsPsych.timelineVariable('data'),
  on_load: function() {
    $(document.body).css({'background': this.background});
  },
  on_finish: function(data){
    $(document.body).css({'background': 'white'});
    data.correct = data.direction == data.correct_response;
  },
};

var factors = {
    cue: [s1, s2],
    outcome: [o1, o2],
    delay: [2, 4, 10]
};
var trials = jsPsych.randomization.factorial(factors, 1);
var test_variables = [];
trials.forEach((item, index) => {
  var vars = {
      outcome: 'img/' + item.outcome + '.jpg',
      delay_prompt: '<div>On the following trial, you can earn 1 ' + item.outcome + ' point</div>',
      prompt: '<div>earn 1 ' + item.outcome + ' point</div>',
      cue: item.cue,
      delay: item.delay * 1000
  }
  var data = {test_part: 'test-response'}
  if (item.outcome == o1) {
    data.correct_response = r1
  } else {
    data.correct_response = r2
  }
  vars.data = data
  test_variables.push(vars)
});
var test_procedure = {
  timeline: [test_delay, test_outcome, test_distraction, test_response],
  timeline_variables: test_variables,
  randomize_order: true
};
timeline.push(test_procedure);

/* debrief */
// FIXME: display points earned?
var debrief_block = {
  type: "html-keyboard-response",
  stimulus: function() {
    var trials = jsPsych.data.get().filter({test_part: 'test'});
    var correct_trials = trials.filter({correct: true});
    var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    var rt = Math.round(correct_trials.select('rt').mean());

    return "<p>You responded correctly on "+accuracy+"% of the trials.</p>"+
    "<p>Your average response time was "+rt+"ms.</p>"+
    "<p>Press any key to complete the experiment. Thank you!</p>";
  }
};
timeline.push(debrief_block);