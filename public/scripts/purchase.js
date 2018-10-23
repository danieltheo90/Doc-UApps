function myFunction()
{
    var myForm = document.getElementById('form-id');
    var allInputs = myForm.getElementsByClassName('allfilters');
    var input, i;

    for(i = 0; input = allInputs[i]; i++) {
        if(input.getAttribute('name')&& !input.value) {
            input.setAttribute('name', '');
        }
    }
}
