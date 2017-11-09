/**
 *  Analyze entities from the text string


nlp.analyzeEntities( nlpText )
    .then(function( entities ) {
        // 	Output returned entities
        console.log( 'Entities:', JSON.stringify( entities) );
    })
    .catch(function( error ) {
        // 	Error received, output the error
        console.log( 'Error:', error.message );
    })


               *  Analyze syntax from the text string


              nlp.analyzeSyntax( nlpText )
                  .then(function( syntax ) {
                      console.log( 'Syntax:', JSON.stringify( syntax ));
                  })
                  .catch(function( error ) {
                      console.log( 'Error:', error.message );
                  })


              /**
               *  Analyze syntax from the text string


              //	Default features if `features` param is omitted
              const features = {
                  //syntax:    true,
                  //entities:  true,
                  sentiment: true
              }

              nlp.annotateText( nlpText, features )
                  .then(function( annotations ) {
                      console.log( 'Annotations:',JSON.stringify(  annotations ) );
                  })
                  .catch(function( error ) {
                      console.log( 'Error:', error.message );
                  })
*/
