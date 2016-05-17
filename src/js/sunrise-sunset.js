/* eslint-disable */
/*
  Self-invoking function to grab sunrise/sunset inputs and manipulate their data
 */
(function () {
  /*
    Format a javascript date into how `<input type="datetime"` requires it to be formatted

    @param {string} date

    @returns {string} date in format `yyyy-mm-dd`
   */
  var formatDate = function (date) {
    var d, month, day, year;
    if (date) {
      d = new Date(date);
    }
    else {
      d = new Date();
    }
    month = (d.getMonth() + 1);
    day = d.getDate();
    year = d.getFullYear();

    if (month.toString().length < 2) {
      month = '0' + month;
    }
    if (day.toString().length < 2) {
      day = '0' + day;
    }
    return [year, month, day].join('-');
  };

  /*
    Compare sunrise and sunset dates

    @param {object} sun object containing element objects for all four inputs

    @returns {true|string} value `true` if sunrise is _before_ sunset; `string` if an error has occurred
   */
  var compareSunriseSunset = function (sun) {
    var sunriseFullDate, sunsetFullDate;

    // if sunrise and sunset have values, compare the two
    if (sun.rise.date.value && sun.set.date.value) {
      sunriseFullDate = new Date(Date.parse(sun.rise.date.value + ' ' + sun.rise.time.value)).getTime();
      sunsetFullDate = new Date(Date.parse(sun.set.date.value + ' ' + sun.set.time.value)).getTime();

      // if sunset is the same or before sunrise
      if (sunriseFullDate >= sunsetFullDate) {
        return 'Sunrise date must be before sunset date.';
      }
    }
    return true;
  };

  /*
    Validation on sunrise inputs

    @param {object} sun object containing element objects for all four inputs

    @returns {true|string} value `true` if sunrise is _before_ sunset; `string` if an error has occurred
   */
  var riseVal = function (sun) {
    var sunrise = sun;

    // if sunrise date has no value, populate with today's date
    if (!sunrise.rise.date.value) {
      sunrise.rise.date.value = formatDate();
    }

    // if sunrise time has no value, populate with midnight
    if (!sunrise.rise.time.value) {
      sunrise.rise.time.value = '00:00';
    }
    return compareSunriseSunset(sunrise);
  };

  /*
    Validation on sunset inputs

    @param {object} sun object containing element objects for all four inputs

    @returns {true|string} value `true` if sunrise is _before_ sunset; `string` if an error has occurred
   */
  var setVal = function (sun) {
    var sunset = sun;

    // if sunset time has no value, populate with midnight
    if (!sunset.set.time.value) {
      sunset.set.time.value = '00:00';
    }
    return compareSunriseSunset(sunset);
  };

  // create object from inputs
  var sun = {
    rise: {
      date: document.getElementById('sunrise-date'),
      time: document.getElementById('sunrise-time')
    },
    set: {
      date: document.getElementById('sunset-date'),
      time: document.getElementById('sunset-time')
    }
  };
  var sunContainer = document.getElementById('sunrise-sunset');

  /*
    Event handler for sunrise/set inputs

    @param {true|string} value `true` if sunrise is _before_ sunset; `string` if an error has occurred
   */
  var sunHandler = function (that, validation) {
    var message, insertRef;
    var currentMessage = sunContainer.querySelector('[role="alert"]');

    // Add/Remove validation
    if (validation === true) {
      // Check to see if there is a current alert message for this input
      if (currentMessage) {
        // Remove invalid
        that.removeAttribute('aria-invalid');

        // Delete the current message if it exists
        sunContainer.removeChild(currentMessage);
      }
    }
    else {
      // Create error message
      message = document.createElement('p');
      message.className = 'form--alert';
      message.setAttribute('role', 'alert');
      message.setAttribute('for', that.id);
      message.textContent = validation;
      if (!currentMessage) {
        // Set element to invalid
        that.setAttribute('aria-invalid', 'true');
        insertRef = sunContainer.querySelector('legend');
        sunContainer.insertBefore(message, insertRef.nextSibling);
      }
    }
  };

  // if sunrise date has no value, populate with today's date
  if (sun.rise.date.value === '') {
    sun.rise.date.value = formatDate();
    sun.rise.time.value = '00:00';
  }

  // watch for blur on sunrise/set inputs
  sun.rise.date.addEventListener('blur', function () { sunHandler(this, riseVal(sun)); }, false);
  sun.rise.time.addEventListener('blur', function () { sunHandler(this, riseVal(sun)); }, false);
  sun.set.date.addEventListener('blur', function () { sunHandler(this, setVal(sun)); }, false);
  sun.set.time.addEventListener('blur', function () { sunHandler(this, setVal(sun)); }, false);
})();
