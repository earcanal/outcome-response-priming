/**
 * jspsych-html-mouse-response
 * Paul Shapre
 *
 * plugin for displaying a stimulus and getting a mouse response
 *
 *
 **/

jsPsych.plugins['html-mouse-response'] = (function() {
  const width    = 640;
  const x_centre = width / 2;
  const height   = 360;
  const y_centre = height / 2;
  const RADIUS   = 10;

  var plugin = {};

  plugin.info = {
    name: "html-mouse-response",
    description: '',
    parameters: {
      background: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Background',
        default: 'black',
        description: 'Mouse area background color.'
      },
      foreground: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Foreground',
        default: 'white',
        description: 'Dot color.'
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var new_html = '<canvas width="' + width + '" height="' + height + '" id="jspsych-html-keyboard-response-stimulus">Your browser does not support HTML5 canvas</canvas>';

    // add prompt
    if(trial.prompt !== null){
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;

    // store response
    var response = {
      rt: null,
      direction: null
    };

    // end trial when it is time
    var end_trial = function() {
      jsPsych.pluginAPI.clearAllTimeouts(); // kill any remaining setTimeout handlers
      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "direction": direction
      };
      display_element.innerHTML = '';   // clear the display
      jsPsych.finishTrial(trial_data);  // move on to the next trial
    };

    // function to handle responses by the subject
    var after_response = function(response) {

      direction = response;
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      //display_element.querySelector('#jspsych-html-mouse-response-stimulus').className += ' responded';

      end_trial();
    };

    var direction = '';

    function degToRad(degrees) {
      var result = Math.PI / 180 * degrees;
      return result;
    }

    // setup canvas
    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var x = x_centre;
    var y = y_centre;

    function canvasDraw() {
      ctx.fillStyle = trial.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = trial.foreground;
      ctx.beginPath();
      ctx.arc(x, y, RADIUS, 0, degToRad(360), true);
      ctx.fill();
    }
    canvasDraw();
    lock();

    // pointer lock object forking for cross browser
    canvas.requestPointerLock = canvas.requestPointerLock ||
                                canvas.mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock ||
                               document.mozExitPointerLock;

    var locked = 0;
    canvas.onclick = function() {
      if (locked) {
        unlock();
      } else {
        lock();
      }
    };

    function lock() {
      canvas.requestPointerLock();
      locked = 1;
    }
    function unlock() {
      document.exitPointerLock();
      locked = 0
    }
    function center_pointer() {
      x = x_centre
      y = y_centre
      canvasDraw()
    }

    // pointer lock event listeners
    // Hook pointer lock state change events for different browsers
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    function lockChangeAlert() {
      if (document.pointerLockElement === canvas ||
          document.mozPointerLockElement === canvas) {
        document.addEventListener("mousemove", updatePosition, false);
      } else {
        document.removeEventListener("mousemove", updatePosition, false);
      }
    }


    var animation;
    function updatePosition(e) {
      x += e.movementX;
      y += e.movementY;
      if (x >= x_centre + 100) {
        unlock()
        after_response('right')
      }
      if (x <= x_centre - 100) {
        unlock()
        after_response('left')
      }

      if (x > canvas.width + RADIUS) {
        x = -RADIUS;
      }
      if (y > canvas.height + RADIUS) {
        y = -RADIUS;
      }  
      if (x < -RADIUS) {
        x = canvas.width + RADIUS;
      }
      if (y < -RADIUS) {
        y = canvas.height + RADIUS;
      }

      if (!animation) {
        animation = requestAnimationFrame(function() {
          animation = null;
          canvasDraw();
        });
      }
    }


    // start the response listener
    /*
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'date',
      persist: false,
      allow_held_key: false
    });
  */

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
