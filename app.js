var ref = new Firebase("https://google-fb-translate.firebaseio.com/");
var usersRef = ref.child("users");
var messagesRef = ref.child("messages");
var user = null;

//Auth
$('#google').on('click', function (e) {
  ref.authWithOAuthPopup("google", function (error, authData) {
    if (error) {
      console.log(error);
    } else {
      var fullName = authData.google.displayName;
      var pic = authData.google.cachedUserProfile.picture;
      var id = authData.google.id;
      var firstName = authData.google.cachedUserProfile.given_name;
      usersRef.child(id).set({full_name: fullName, pic: pic, first_name: firstName});
    }
  });
});

ref.onAuth(function (authData) {
  if (authData) {
    user = authData.google;
    $('#authed').empty();
    $('#authed').text('Signed in as ' + user.displayName);
    usersRef.child(user.id).child('language_pref').child('lang_code').once('value', function (snap) {
      $('#' + snap.val()).addClass('selected-lang');
    });
  }
});

messagesRef.on('child_added', function (snap) {
  var msg = snap.val();
  var user = msg.user;
  var body = msg.message;
  $('<div class="message">').html('<a href="https://plus.google.com/' + msg.user_id + '"><img class="user-pic" src="' + msg.pic + '"/></a><div class="msg-text">' + user + ': <span id="' + snap.name() + '">' + body + '</span></div>').prependTo($('#chat'));
});

//TODO: make this translate all chat message's to user's language
$('.lang').on('click', function (e) {
    var langCode = e.target.id;
    var langName = $(e.target).text();
    usersRef.child(user.id).child('language_pref').set({lang_code: langCode, lang_name: langName});
    localStorage.setItem('langCode', langCode);
    localStorage.setItem('langName', langName);
    $('.lang').addClass('inactive-lang');
    $('#' + langCode).removeClass('inactive-lang').addClass('selected-lang');
    $('#chat div span').each(function (data) {
      var textToTranslate = $(this).text();
      // var newScript = document.createElement('script');
      // newScript.type = 'text/javascript';
      // var source = 'https://www.googleapis.com/language/translate/v2?key=AIzaSyCe7PGjTlO5cM-upDqti3FfSC14GHjOiBU&source=en&target=' + langCode + '&callback=translateText&q=' + textToTranslate;
      // newScript.src = source;
      // document.getElementsByTagName('head')[0].appendChild(newScript);
    });
});

//Translation
function translateText(response) {
  var translation = response.data.translations[0].translatedText;
  var langCode = localStorage.getItem('langCode');
  messagesRef.push({message: translation, sourceLang: langCode, user: user.displayName, user_id: user.id, pic: user.cachedUserProfile.picture});
  $('#sourceText').val('');
}

$('#sourceText').on('keypress', function (e) {
    if (e.keyCode === 13) {
      var newScript = document.createElement('script');
      newScript.type = 'text/javascript';
      var sourceText = $('#sourceText').val();
      var langCode = localStorage.getItem('langCode');

      if (langCode !== 'en') {
        var source = 'https://www.googleapis.com/language/translate/v2?key=AIzaSyCe7PGjTlO5cM-upDqti3FfSC14GHjOiBU&source=en&target=' + langCode + '&callback=translateText&q=' + sourceText;
        newScript.src = source;
        document.getElementsByTagName('head')[0].appendChild(newScript);
      } else {
        var translation = $('#sourceText').val();
        messagesRef.push({message: translation, sourceLang: langCode, user: user.displayName, user_id: user.id, pic: user.cachedUserProfile.picture});
        $('#sourceText').val('');
      }
    }
});