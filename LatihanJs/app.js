import student from "./models/Student.js";
import BankAccount from "./models/BankAccount.js";

const mhs = new Student("Budi", 21, "123456", "Informatika");
mhs.greet();
mhs.study();  

const rekeningMhs = new BankAccount(mhs.name);
rekeningMhs.deposit(200000);
rekeningMhs.withdraw(50000);   

document.getElementById("app").innerHTML = `
<h2>Data Mahasiswa</h2>
<p><strong>Nama:</strong> ${mhs.name}</p>
<p><strong>Umur:</strong> ${mhs.age} Tahun</p>
<p><strong>NIM:</strong> ${mhs.nim}</p>
<p><strong>Jurusan:</strong> ${mhs.major}</p>
<p><strong>Saldo Akhir:</strong> RP${rekeningMhs.getBalance ().toLocaleString('id-ID')}</p>
`;