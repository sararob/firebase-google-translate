var googleTranslate = require('google-translate')('AIzaSyCe7PGjTlO5cM-upDqti3FfSC14GHjOiBU');
var firebase = require('firebase');

googleTranslate.translate('My name is Sara', 'es', function(err, translation) {
  console.log(translation.translatedText);
  // =>  Mi nombre es Sara
});

googleTranslate.detectLanguage('Tak', function(err, detection) {
  console.log(detection.language);
  // =>  es
});