$( document ).ready(function() {
    var SCHEMA;
    $.getJSON( "schemas/schema"+stage+".json", function( data ) {
        SCHEMA=data;
        console.log(SCHEMA);
    });
    previous = localStorage.getItem('openActiveJson');
    if (previous) {
      editor.setValue(previous);
    }

    $("#next").on("click", function() {
      step = stage + 1;
      localStorage.setItem('openActiveJson',editor.getValue())
      window.location.href = "step" + step + ".html";
    });
    $("#validate").on("click", function() {
      $("#success").hide();
      try {
        var json = editor.getValue();
        console.log(JSON.parse(json));
      } catch (e) {
        if (e instanceof SyntaxError) {
            $("#error-detail").hide();
            $('#validation-message').html(e);
            $('#validation-detail').show();
            return false;
        }
      }
      $('#validation-detail').hide();
       var type = $("#type").val();
       if (!type) {
        type = "event";
       }
       SCHEMA["$ref"] = "#/definitions/" + type;
       //$("#data-group").removeClass("has-success has-danger");
       $("#error-detail").hide();
       config = {allErrors: true, verbose: true};
       if (!$("#mode").is(":checked")) {
           console.log("Adding removeAdditional, to use lax validation");
           config["removeAdditional"] = "all";
       }
       ajv = new Ajv(config);
       var validate = ajv.compile(SCHEMA);
       console.log('here');
       var valid = validate( JSON.parse( json ));
       if (valid) {
           $("#success").show();
           $("#next").show();
       } else {
           //$("#data-group").addClass("has-danger");
           $("#errors").html("");
           $("#num-errors").text( validate.errors.length > 1 ? validate.errors.length + " errors" : "1 error" );
           $.each(validate.errors, function(index, value) {
               if (value["keyword"] === "additionalProperties") {
                   $("#errors").append('<tr><td>' + value["dataPath"] + '</td><td>'
                       + value["message"] + '</td><td>' + value["params"]["additionalProperty"] + '</td></tr>');
               }
               else if (value["keyword"] === "enum") {
                       $("#errors").append('<tr><td>' + value["dataPath"] + '</td><td>'
                           + value["message"] + ' (' + value["params"]["allowedValues"] + ')</td><td>' + value["data"] + '</td></tr>');
               } else {
                   $("#errors").append('<tr><td>' + value["dataPath"] + '</td><td>'
                       + value["message"] + '</td><td>' + value["data"] + '</td></tr>');
               }
           });
           $("#error-detail").show();
       }
       return false;
    });
});