const formOpenLoginBtn = document.querySelector("#form-open-login"),
  formOpenSignupBtn = document.querySelector("#form-open-signup"),
  home = document.querySelector(".home"),
  formContainer = document.querySelector(".form_container"),
  formCloseBtn = document.querySelector(".form_close"),
  signupBtn = document.querySelector("#signup"),
  loginBtn = document.querySelector("#login"),
  pwShowHide = document.querySelectorAll(".pw_hide");

formOpenLoginBtn.addEventListener("click", () => {
  home.classList.add("show");
  formContainer.classList.remove("active");
});

formOpenSignupBtn.addEventListener("click", () => {
  home.classList.add("show");
  formContainer.classList.add("active");
});

formCloseBtn.addEventListener("click", () => home.classList.remove("show"));

pwShowHide.forEach((icon) => {
  icon.addEventListener("click", () => {
    let getPwInput = icon.parentElement.querySelector("input");
    if (getPwInput.type === "password") {
      getPwInput.type = "text";
      icon.classList.replace("uil-eye-slash", "uil-eye");
    } else {
      getPwInput.type = "password";
      icon.classList.replace("uil-eye", "uil-eye-slash");
    }
  });
});

signupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  formContainer.classList.add("active");
});
loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  formContainer.classList.remove("active");
});

const bufferToHex = (buffer) => {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
};

const signUp = async () => {
  //const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  //const phone = document.getElementById('phone').value;
  //const address = document.getElementById('address').value;

  // Create a JSON object of the user data
  const userData = JSON.stringify({ password, email });

  // Hash user data using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(userData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = bufferToHex(hashBuffer);

  // Generate a digital signature (use a secret key or your preferred method for signing)
  const signature = CryptoJS.HmacSHA256(userData, 'your-secret-key').toString(CryptoJS.enc.Hex);

  // Send data to server
  const response = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      signature,
      hash: hashHex,
      userData
    })
  });

  const result = await response.json();
  if (result.success) {
    alert('Sign Up Successful');
  } else {
    alert('Error: ' + result.message);
  }
};

// Function to handle the login form submission
const login = async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  // Send data to server
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();
  if (result.success) {
    alert('Login Successful');
  } else {
    alert('Error: ' + result.message);
  }
};