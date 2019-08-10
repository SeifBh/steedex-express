/* 
Activité : gestion des contacts
*/

// TODO : complétez le programme

console.log("Bienvenue chez notre application");
console.log("===================== MENU =====================");
console.log("1 - Lister contacts");
console.log("2 - Ajouter un contact");
console.log("3 - Quitter");
	let saisie = prompt("Choisir votre choix");


var contact1 = {nom:"John", prenom:"4s", age:50, eyeColor:"blue"};
var contact2 = {nom:"Med", prenom:"Doe", age:50, eyeColor:"blue"};

var tabContact =[];

tabContact.push(contact1);
tabContact.push(contact2);
function affiche(){
	tabContact.forEach(contact => {
		  console.log(contact.nom);
		});
}
if(saisie == '1'){
		tabContact.forEach(contact => {
		  console.log(contact.nom);
		});


}
else if (saisie == 2) {
	let nomsaisie = prompt("Ajouter nom");
	let prenomsaisie = prompt("Ajouter prenom");
var contact3 = {nom:nomsaisie, prenom:prenomsaisie, age:50, eyeColor:"blue"};
tabContact.push(contact3);

console.log('Contact ajoutéé avec succes')

affiche();
}
else{
	alert("vouz avez choisir de quitter")

}

