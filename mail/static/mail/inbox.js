document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#submit').addEventListener('click', send_mail);


  // By default, load the inbox
  load_mailbox('inbox');

});


const mailEngine= async (mailbox,send_mail,get_mail_id) =>{
	if(mailbox){
		var email = await fetch(`/emails/${mailbox}`);
		return email.json();
	}
	else if(send_mail){
		var response = await fetch(send_mail['url'],send_mail['data']);
		return response.json();
	}
}


function send_mail(){
	let mail_info={};
	mail_info['url']='/emails';
	mail_info['data']={
    	method: 'POST',
    	body: JSON.stringify({
    		recipients: document.querySelector('#compose-recipients').value,
    		subject: document.querySelector('#compose-subject').value,
    		body: document.querySelector('#compose-body').value
		})
  }
	mailEngine(undefined,mail_info,undefined)
		.then(response =>{
      if(response.message){
        document.getElementById("success_msg").innerText=response.message;
        setTimeout(()=>{document.getElementById("success_msg").innerText=""}, 5000);
      }
      else{
        document.getElementById("fail_msg").innerText=response.error;
        setTimeout(()=>{document.getElementById("fail_msg").innerText=""}, 5000);
      }

		});
		load_mailbox('sent');
}
function compose_email() {

	let recepients=document.querySelector('#compose-recipients');
	let subject=document.querySelector('#compose-subject');
	let body=document.querySelector('#compose-body');

	var validateInput= () => {
		if(recepients.value===""||subject.value===""||body.value===""){
			document.getElementById("submit").disabled=true;
		}
		else{
			document.getElementById("submit").disabled=false;
		}

	}
	document.querySelector('#compose-recipients').onkeyup = validateInput;
	document.querySelector('#compose-subject').onkeyup = validateInput;
	document.querySelector('#compose-body').onkeyup = validateInput;



  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  validateInput();
}

function load_mailbox(mailbox) {
	mailEngine(mailbox,undefined,undefined)
		.then(mails => {
		if(mailbox==="inbox"){

			//create a container for the message
			var container=document.createElement('div');
			container.setAttribute("class","container");
			var sender =document.createElement('p');
			sender.setAttribute("class","sender");
			var subject =document.createElement('p');
			subject.setAttribute("class","subject");
			var timestamp =document.createElement('p');
			timestamp.setAttribute("class","timestamp");

			if (mails.length!==0){
        console.log(mails);
				for(mail in mails){
					sender.innerText=mail.sender;
					subject.innerText=mail.subject;
					timestamp.innerText=mail.timestamp;

					container.appendChild(sender,subject,timestamp);

					document.querySelector('#emails-view').appendChild(container);

				}
			}
			else{
			container.innerHTML="<h4>Inbox is empty </h4>";
			document.querySelector('#emails-view').appendChild(container);
			}
		}
  })
  .catch(error => {
    document.getElementById("fail_msg").innerText=error;
    setTimeout(()=>{document.getElementById("fail_msg").innerText=""}, 5000);
  });

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}
