var Uploader = (function(){
  
   var uploader = {}
   
    uploader.start = function(options){
    var $upload = $(options.upload)
    var $s3file = $(options.s3file)
    var $form = $(options.form)
    var $progressBar = $(options.progressBar)
    var $progressLabel = $(options.progressLabel)
    
    $('#s3form').ajaxForm({
        success: function(){
            $progressLabel.text("DONE")
        },
        uploadProgress: function(e, p, t, percent){
            var complete = percent + '%'
            $progressBar.css({
                width: complete
            })
            $progressLabel.text(complete)
        }
    })
    
    
    
    
    $upload.click(function uploadedClicked(e){
        e.preventDefault()
        handleUpload($s3file, function(err){
            if(err){
                console.error(err)
            }
        })
    })
    }
    
   
    function handleUpload($s3file, $form, cb){
        var filename = $s3file[0].files[0].name;
        
        getCredentials(filename, function(err, creds){
            if(err) {return cb(err) }
            
            var fields = creds.fields;
    
    
    populateFields(fields);
    setTimeout(submitForm,1000)
    console.log(creds)
        })
        
    }
    function submitForm(){
        $('#s3form').submit()
    }
    function populateFields(fields){
      $('input[name="key"]').val(fields.key);
      $('input[name="acl"]').val(fields.acl);
   // $('input[name="success_action_redirect"]').val(fields.success_action_redirect); 
    $('input[name="Content-Type"]').val(fields["Content-Type"]);
    $('input[name="X-Amz-Credential"]').val(fields["x-amz-credential"]); 
    $('input[name="X-Amz-Algorithm"]').val(fields["x-amz-algorithm"]); 
    $('input[name="X-Amz-Date"]').val(fields["x-amz-date"]);  
    $('input[name="Policy"]').val(fields.policy); 
    $('input[name="X-Amz-Signature"]').val(fields["x-amz-signature"]);   
        
    }
    
    function getCredentials(filename, cb){
        $.ajax({
            url: "/api/s3creds",
            type: "POST",
            dataType: "json",
            data: {
                filename: filename
            },
            success: function(data){
                cb(undefined, data)
            },
            error: cb
    })
    }
    return uploader
})();