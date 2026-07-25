$(document).ready(function () {

  // Mobile nav toggle
  $('#navToggle').on('click', function () {
    $('#navLinks').toggleClass('open');
  });

  // Close mobile nav on link click
  $('#navLinks a').on('click', function () {
    $('#navLinks').removeClass('open');
  });

  // School search filter
  $('#schoolSearch').on('keyup', function () {
    var value = $(this).val().toLowerCase();
    $('#schoolList .school-list-item').each(function () {
      var schoolName = $(this).find('.school-info h3').text().toLowerCase();
      var location = $(this).find('.school-info p').text().toLowerCase();
      if (schoolName.indexOf(value) > -1 || location.indexOf(value) > -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });

  // Bottom nav active state
  $('.bottom-nav-item').on('click', function (e) {
    e.preventDefault();
    $('.bottom-nav-item').removeClass('active');
    $(this).addClass('active');
  });

  // Pay Fees button — store school data and navigate
  $('.pay-fees-btn').on('click', function (e) {
    e.preventDefault();
    var schoolData = {
      name: $(this).data('school'),
      location: $(this).data('location'),
      type: $(this).data('type'),
      logo: $(this).data('logo'),
      amount: $(this).data('amount')
    };
    localStorage.setItem('selectedSchool', JSON.stringify(schoolData));
    window.location.href = '/pay-fees/';
  });

  // Pay Fees page — populate school data from localStorage
  if ($('#schoolName').length) {
    var school = JSON.parse(localStorage.getItem('selectedSchool'));
    if (school) {
      $('#schoolName').text(school.name);
      $('#schoolLocation').text(school.location);
      $('#schoolType').text(school.type);
      $('#schoolLogo').attr('src', school.logo).attr('alt', school.name);
      $('#totalFees').text('MWK ' + school.amount);
      $('#feesBalance').text('MWK ' + school.amount);
    }
  }

});
