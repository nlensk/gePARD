document.getElementById("browseButton")
.addEventListener("click",()=>{

window.location.href="pages/browse.html";

});

window.addEventListener("load", async () => {

    await database.load();

    console.log(database.getAllGenomes());

});