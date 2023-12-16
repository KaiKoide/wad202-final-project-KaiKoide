$(() => {
  //Start coding here!
  $.get("http://localhost:3000/accounts").done((data) =>
    console.log("data", data)
  );
});
