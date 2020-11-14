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


const mailEngine= async (mailbox,send_mail,get_mail_id,status_change) =>{
  var email='';
	if(mailbox){
		email = await fetch(`/emails/${mailbox}`);
		return email.json();
	}
	else if(send_mail){
		email = await fetch(send_mail['url'],send_mail['data']);
		return email.json();
	}
  else if(get_mail_id){
    // view of a specific mails
    email=await fetch(`/emails/${get_mail_id}`)
    return email.json();
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
	mailEngine(undefined,mail_info,undefined,undefined)
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
	mailEngine(mailbox,undefined,undefined,undefined)
		.then(mails => {
      // create a container for the whole in a load_mailbox
      var mail_container=document.createElement('div');
      mail_container.setAttribute("class","mail_container")

      // create an element to use for empty mail
      var empty_mail = document.createElement('div');
      empty_mail.setAttribute("class", "empty_mail");



			if (mails.length!==0){
				mails.forEach( mail =>{

          //create a container for each  message content display
          var msg_container=document.createElement('div');
          msg_container.setAttribute("class","msg_container");
          // create an element to hold the sender
          var sender =document.createElement('p');
          sender.setAttribute("class","sender");

          // create an element to hold the subject
          var subject =document.createElement('p');
          subject.setAttribute("class","subject");

          // create en element to told the recepients
          var recipient= document.createElement('p');
          recipient.setAttribute("class", "recipient");

          // create an element to hold the timestamp
          var timestamp =document.createElement('p');
          timestamp.setAttribute("class","timestamp");

            if(mail.read){
              msg_container.style.background="white";
            }
            else {
                msg_container.style.background="gray";
            }
  					sender.appendChild(document.createTextNode(mail.sender));
  					subject.appendChild(document.createTextNode(mail.subject));
  					timestamp.appendChild(document.createTextNode(mail.timestamp));

            if(mailbox==="inbox"){
                msg_container.appendChild(sender);
            }
          else{
            console.log(mail.recipients);
            let r="";
            if(mail.recipients.length > 1 ){
              r=mail.recipients[0] + "...";
            }
            else{
              r=mail.recipients;
            }
            recipient.appendChild(document.createTextNode(r));
            msg_container.appendChild(recipient);
          }

          msg_container.appendChild(subject);
          msg_container.appendChild(timestamp);

          // add event listener to view the mails
          msg_container.addEventListener('click',()=>{
            mail_container.innerHTML=""; // removes initial content of the element
            mail_container.style.background="gray";
            mail_container.appendChild(document.createTextNode(`Subject: ${mail.subject}`))
            mail_container.appendChild(document.createElement('br'));
            mail_container.appendChild(document.createTextNode(`To: ${mail.recipients}`));
            mail_container.appendChild(document.createElement('br'));
            mail_container.appendChild(document.createTextNode(`From: ${mail.sender}`));
            mail_container.appendChild(document.createElement('br'));

            // create a text area to display the content of the mail
            let msg=document.createElement("div");
            msg.setAttribute('class',"msg");

            msg.style.disabled="true";
            msg.innerText=mail.body;
          //mail_container.appendChild(msg);
          });
          // first append the msg_container to the mail_container
          mail_container.appendChild(msg_container);
					document.querySelector('#emails-view').appendChild(mail_container);

				});
			}
			else{
  			empty_mail.innerHTML=`<h5>${mailbox.charAt(0).toUpperCase()+ mailbox.slice(1)} is empty </h5>`;
  			document.querySelector('#emails-view').appendChild(empty_mail);
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
