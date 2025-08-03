export class GameMessage {
    constructor(title, message, type) {
        this.title = title;
        this.message = message;
        this.type = type;
    }

    show_Message() {
        console.log('show_Message called');
        
        let message_body = document.createElement('div');
        message_body.classList.add('message-body');

        let message_title = document.createElement('p');
        message_title.innerText = this.title;


        let message_text = document.createElement('p');
        message_text.innerText = this.message;


        message_body.appendChild(message_title);
        message_body.appendChild(message_text);


        if (this.type === 'error') {
            message_body.classList.add('error');
        } else if (this.type === 'success') {
            message_body.classList.add('success');
        } else if (this.type === 'info') {
            message_body.classList.add('info');
        }
        document.body.appendChild(message_body);
    }
    
}