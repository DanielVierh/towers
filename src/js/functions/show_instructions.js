export function show_instructions() {
    let modal = document.createElement('div');
    modal.classList.add('modal');
    modal.classList.add('modal-instructions');
    modal.style.display = 'flex';
    modal.style.zIndex = '999999999'

    let title = document.createElement('h2');
    title.innerHTML = 'Anleitung';


    console.log('Modal', modal);
    

    modal.appendChild(title);

    document.body.appendChild(modal);
}