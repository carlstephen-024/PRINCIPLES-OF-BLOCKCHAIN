// RSA key generation using the selected key size
function generateRSAKeys(bitSize) {
  var crypt = new JSEncrypt({ default_key_size: bitSize });

  crypt.getKey();

  return {
    publicKey: crypt.getPublicKey(),
    privateKey: crypt.getPrivateKey(),
  };
}

function encryptData(publicKeyPem, plaintext) {
  var encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKeyPem);

  var ciphertext = encrypt.encrypt(plaintext);
  return ciphertext;
}

function decryptData(privateKeyPem, ciphertext) {
  var decrypt = new JSEncrypt();
  decrypt.setPrivateKey(privateKeyPem);

  var plaintext = decrypt.decrypt(ciphertext);
  return plaintext;
}

function handleFormSubmit(bitSize) {
  event.preventDefault();

  // Collect user input
  var fullName = document.getElementById("fullName").value.trim();
  var dob = document.getElementById("dob").value.trim();
  var yearLevel = document.getElementById("yearLevel").value;
  var gender = document.querySelector('input[name="gender"]:checked');
  var username = document.getElementById("username").value.trim();
  var password = document.getElementById("password").value.trim();

  // Ensure all fields are completed
  if (!fullName || !dob || !yearLevel || !gender || !username || !password) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  var genderVal = gender.value;

  // Generate RSA key pair
  var keys = generateRSAKeys(bitSize);

  // Encrypt form data using the public key
  var encFullName = encryptData(keys.publicKey, fullName);
  var encDob = encryptData(keys.publicKey, dob);
  var encYearLevel = encryptData(keys.publicKey, yearLevel);
  var encGender = encryptData(keys.publicKey, genderVal);
  var encUsername = encryptData(keys.publicKey, username);
  var encPassword = encryptData(keys.publicKey, password);

  // Verify the process by decrypting with the private key
  var decFullName = decryptData(keys.privateKey, encFullName);
  var decDob = decryptData(keys.privateKey, encDob);
  var decYearLevel = decryptData(keys.privateKey, encYearLevel);
  var decGender = decryptData(keys.privateKey, encGender);
  var decUsername = decryptData(keys.privateKey, encUsername);
  var decPassword = decryptData(keys.privateKey, encPassword);

  document.getElementById("bitSizeDisplay").textContent = bitSize;

  document.getElementById("publicKeyDisplay").textContent = keys.publicKey;
  document.getElementById("privateKeyDisplay").textContent = keys.privateKey;

  // Display encrypted values
  document.getElementById("encFullName").textContent = encFullName || "(encryption failed)";
  document.getElementById("encDob").textContent = encDob || "(encryption failed)";
  document.getElementById("encYearLevel").textContent = encYearLevel || "(encryption failed)";
  document.getElementById("encGender").textContent = encGender || "(encryption failed)";
  document.getElementById("encUsername").textContent = encUsername || "(encryption failed)";
  document.getElementById("encPassword").textContent = encPassword || "(encryption failed)";

  // Display decrypted values
  document.getElementById("decFullName").textContent = decFullName || "(decryption failed)";
  document.getElementById("decDob").textContent = decDob || "(decryption failed)";
  document.getElementById("decYearLevel").textContent = decYearLevel || "(decryption failed)";
  document.getElementById("decGender").textContent = decGender || "(decryption failed)";
  document.getElementById("decUsername").textContent = decUsername || "(decryption failed)";
  document.getElementById("decPassword").textContent = decPassword || "(decryption failed)";

  // Reveal the results section
  document.getElementById("resultCard").style.display = "block";
}