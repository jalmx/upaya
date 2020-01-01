const menuIcon = document.getElementById('icon-menu');
const menu = document.getElementById('menu');

menuIcon.addEventListener('click', (e) => {
    menu.classList.toggle('menu__main')
})

menu.addEventListener('click', (e) => {
    if (e.target.tagName !== 'LI') {
        menu.classList.add('menu__main')
    }
})