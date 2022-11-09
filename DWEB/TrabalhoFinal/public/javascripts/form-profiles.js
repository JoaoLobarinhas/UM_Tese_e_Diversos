
$(document).ready(function() {
    var sn = window.location.pathname
    sn = sn.split("/")
    const studentNumber = sn[2]

    if ($("#btnFollow").length){
        $("#btnFollow").click(function(){
            var form = document.createElement("form")
            form.style.display="none"
            form.id="formDelete"
            var element = document.createElement("input"); 
            form.method = "POST";
            form.action = "/user/followUser";   

            element.value=studentNumber;
            element.name="studentNumber";
            form.appendChild(element);  

            document.body.appendChild(form);

            form.submit();

            document.getElementById("formDelete").remove();
        })
    }
});


