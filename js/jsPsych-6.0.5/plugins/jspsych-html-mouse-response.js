/**
 * jspsych-html-mouse-response
 * Paul Shapre
 *
 * plugin for displaying a stimulus and getting a mouse response
 *
 *
 **/

jsPsych.plugins['html-mouse-response'] = (function() {
  var plugin = {};

  plugin.info = {
    name: "html-mouse-response",
    description: '',
    parameters: {
      id: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'id',
        default: 'jspsych-html-mouse-response-stimulus',
        description: 'Stimulus id.'
      },
      range: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Range',
        default: 100,
        description: 'Mouse response area.'
      },
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
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the response canvas.'
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
    const width    = height = trial.range;
    const x_centre = width / 2;
    const y_centre = height / 2;
    const RADIUS   = 10;
    var direction  = '';

    var new_html = '<canvas width="' + width + '" height="' + height + 
      '" id="' + trial.id + '">Your browser does not support HTML5 canvas</canvas>' +
      '<div id="tracker"></div>';

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
        "prompt": trial.prompt,
        "direction": direction
      };
      display_element.innerHTML = '';   // clear the display
      jsPsych.finishTrial(trial_data);  // move on to the next trial
    };

    // function to handle responses by the subject
    var after_response = function(response) {

      direction = response;
      unlock();
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      //display_element.querySelector('#jspsych-html-mouse-response-stimulus').className += ' responded';

      end_trial();
    };

    function degToRad(degrees) {
      var result = Math.PI / 180 * degrees;
      return result;
    }

    // setup canvas
    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var x = x_centre;
    var y = y_centre;

    // pointer lock object forking for cross browser
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    document.exitPointerLock  = document.exitPointerLock  || document.mozExitPointerLock;

    function canvasDraw() {
      ctx.fillStyle = trial.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = trial.foreground;
      ctx.beginPath();
      ctx.arc(x, y, RADIUS, 0, degToRad(360), true);
      ctx.fill();
    }
    canvasDraw();

    // User _must_ have allowed fullscreen prior to this for lock/unlock to work.
    // See NOTE in https://w3c.github.io/pointerlock/#extensions-to-the-element-interface
    // Sequential trials using this plugin fail to keep the pointer locked in Chrome 70.0.3538.77 (Ubuntu)
    lock();

    canvas.onclick = function() {
      lock();
    };

    function lock() {
      canvas.requestPointerLock();
    }
    function unlock() {
      document.exitPointerLock();
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
    document.addEventListener('pointerlockerror', lockError, false);

    function lockError() {
      console.log('Pointer lock error.')
    }
    function lockChangeAlert() {
      if (document.pointerLockElement === canvas ||
          document.mozPointerLockElement === canvas) {
        console.log('The pointer lock status is now locked');
        document.addEventListener("mousemove", updatePosition, false);
      } else {
        console.log('The pointer lock status is now unlocked');  
        document.removeEventListener("mousemove", updatePosition, false);
      }
    }

    var animation;
    function updatePosition(e) {
      x += e.movementX;
      y += e.movementY;
      if (x >= x_centre + x_centre) {
        after_response('right')
      }
      if (x <= x_centre - x_centre) {
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
      //tracker.textContent = "X position: " + x + ", Y position: " + y + ' width = ' + width;

      if (!animation) {
        animation = requestAnimationFrame(function() {
          animation = null;
          canvasDraw();
        });
      }
    }

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
