const readline = require('readline');
const db = require('./config');
const Table = require('cli-table');
let table = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

mainLogin();

/* start otentikasi */

function mainLogin() {
    console.log(`==============================================
Welcome to Universitas Pendidikan Indonesia
Jl Setiabudhi No. 255
==============================================`);
    askUsername();
}

function askUsername() {
    rl.question('username:', (username) => {
        db.all(`select * from users where username = $username`, {
            $username: username
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {
                askPassword(rows[0]);
            } else {
                console.log(`username tidak ada`);
                askUsername();
            }


        })

    });
}

function askPassword(user) {
    rl.question('password:', (password) => {
        if (password == user.password) {
            console.log(`Selamat datang, ${user.username} akses mu adalah ${user.position.toUpperCase()}`);
            mainMenu();
        } else {
            console.log(`password salah silahkan coba lagi`);
            askPassword(user);
        }
    });
}

/* end autentikasi */

function mainMenu() {
    console.log(
        `==============================================
silahkan pilih opsi di bawah ini :
[1]. Mahasiswa
[2]. Jurusan
[3]. dosen
[4]. mata kuliah
[5]. kontrak
[6]. keluar
==============================================`
    );
    rl.question('masukkan salah satu no. dari opsi di atas:', (answer) => {
        switch (answer) {
            case '1':
                mahasiswa();
                break;
            case '2':
                jurusan();
                break;
            case '3':
                dosen();
                break;
            case '4':
                Matakuliah();
                break;
            case '5':
                kontrak();
                break;
            case '6':
                console.log('selesai, anda berhasil keluar');
                process.exit(0);
                break;
            default:
                console.log('anda salah memasukkan no. menu');
                break;
        }
    });
}

function mahasiswa() {
    console.log(`
==============================================
silahkan pilih opsi di bawah ini
[1]. daftar mahasiswa
[2]. cari mahasiswa
[3]. tambah mahasiswa
[4]. hapus mahasiswa
[5]. kembali`);
    rl.question('masukkan salah satu no. dari opsi di atas:', (answer) => {
        switch (answer) {
            case '1':
                daftarMurid();
                break;
            case '2':
                cariMurid();
                break;
            case '3':
                tambahMurid();
                break;
            case '4':
                hapusMurid();
                break;
            case '5':
                mainMenu();
                break;
            default:
                console.log('anda salah memasukkan no. menu');
                mahasiswa();
                break;
        }
    });
}

function daftarMurid() {
    db.all(`select mahasiswa.nim, mahasiswa.nama, mahasiswa.alamat, jurusan.namajurusan from mahasiswa, jurusan where mahasiswa.kodejurusan = jurusan.kodejurusan`,
        (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            table = new Table({
                head: ['NIM', 'Nama', 'Alamat', 'Jurusan'],
                colWidths: [10, 30, 30, 30]
            });
            rows.forEach((item) => {
                table.push([item.NIM, item.NAMA, item.ALAMAT, item.NAMAJURUSAN]);
            })
            console.log(table.toString());
            mahasiswa();
        });
}

function cariMurid() {
    rl.question('Masukkan NIM:', (nim) => {
        db.all(`select mahasiswa.nim, mahasiswa.nama, mahasiswa.alamat, jurusan.namajurusan from mahasiswa, jurusan where mahasiswa.kodejurusan = jurusan.kodejurusan and mahasiswa.nim = $nim`, {
            $nim: nim
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {
                //console.log(rows);
                console.log(`
==============================================
DETAILS MAHASISWA
==============================================
NIM         : ${rows[0].NIM}
Nama        : ${rows[0].NAMA}
Alamat      : ${rows[0].ALAMAT}
Jurusan     : ${rows[0].NAMAJURUSAN}
==============================================
            `);
                mahasiswa();
            } else {
                console.log(`mahasiswa dengan NIM ${nim} tidak terdaftar`);
                cariMurid();
            }

        });
    });
}

function tambahMurid() {
    rl.question('NIM: ', (nim) => {
        rl.question('Nama : ', (nama) => {
            rl.question('alamat : ', (alamat) => {
                daftarJurusan(() => {
                    rl.question('ID Jurusan : ', (id) => {
                        rl.question('umur: ', (umur) => {
                            const query = `INSERT INTO mahasiswa (NIM, NAMA, ALAMAT, KODEJURUSAN, usia) VALUES ('${nim}','${nama}', '${alamat}', '${id}', '${umur}')`;
                            db.run(query, (err) => {
                                if (err) throw err;
                                console.log("berhasil di buat");
                                mahasiswa();
                            });
                        });
                    });
                });
            });
        });
    });
};

function hapusMurid() {
    rl.question('masukkan NIM mahasiswa yang akan dihapus:', (kode) => {
        db.all(`select * from mahasiswa where mahasiswa.NIM = $KODE`, {
            $KODE: kode
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {
                db.run(`delete from mahasiswa where mahasiswa.NIM = '${kode}'`, (err) => {
                    if (err) throw err;
                    console.log("berhasil di hapus");
                    mahasiswa();
                })
            } else {
                console.log(`mahasiswa dengan NIM ${kode} tidak terdaftar`);
                hapusMurid();
            }
        });
    });
}

function jurusan() {
    console.log(`
==============================================
silahkan pilih opsi di bawah ini
[1]. daftar jurusan
[2]. cari jurusan
[3]. tambah jurusan
[4]. hapus jurusan
[5]. kembali`);
    rl.question('masukkan salah satu no. dari opsi di atas:', (answer) => {
        switch (answer) {
            case '1':
                daftarJurusan(() => {
                    jurusan();
                });
                break;
            case '2':
                cariJurusan();
                break;
            case '3':
                tambahJurusan();
                break;
            case '4':
                hapusJurusan();
                break;
            case '5':
                mainMenu();
                break;
            default:
                console.log('anda salah memasukkan no. menu');
                jurusan();
                break;
        }
    });
}

function daftarJurusan(cb) {
    db.all(`select * from jurusan`,
        (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            table = new Table({
                head: ['ID Jurusan', 'Nama Jurusan'],
                colWidths: [10, 30]
            });
            rows.forEach((item) => {
                table.push([item.KODEJURUSAN, item.NAMAJURUSAN]);
            })
            console.log(table.toString());
            cb();
        });
}

function cariJurusan() {
    rl.question('Masukkan kode jurusan:', (kode) => {
        db.all(`select * from jurusan where jurusan.KODEJURUSAN = $KODE`, {
            $KODE: kode
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);

            }
            if (rows.length > 0) {
                console.log(`
==============================================
DETAILS JURUSAN
==============================================
Kode Jurusan    : ${rows[0].KODEJURUSAN}
Nama Jurusan    : ${rows[0].NAMAJURUSAN}
==============================================
            `);
                jurusan();
            } else {
                console.log(`jurusan dengan NIJ ${kode} tidak terdaftar`);
                cariJurusan();
            }

        });
    });
}

function tambahJurusan() {
    rl.question('Kode Jurusan: ', (nid) => {
        rl.question('Nama Jurusan: ', (nama) => {
            const query = `INSERT INTO jurusan (KODEJURUSAN, NAMAJURUSAN) VALUES ('${nid}','${nama}')`;
            db.run(query, (err) => {
                if (err) throw err;
                console.log("berhasil di buat");
                jurusan();
            });
        });
    });
};

function hapusJurusan() {
    rl.question('masukkan kode jurusan yang akan dihapus:', (kode) => {
        db.all(`select * from jurusan where jurusan.KODEJURUSAN = $KODE`, {
            $KODE: kode
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {

                db.run(`delete from jurusan where jurusan.KODEJURUSAN = '${kode}'`, (err) => {
                    if (err) throw err;
                    console.log("berhasil di hapus");
                    jurusan();
                })

            } else {
                console.log(`jurusan dengan NIJ ${kode} tidak terdaftar`);
                hapusJurusan();
            }

        });
    });
}

/** DOSEN */
function dosen() {
    console.log(`
==============================================
silahkan pilih opsi di bawah ini
[1]. daftar dosen
[2]. cari dosen
[3]. tambah dosen
[4]. hapus dosen
[5]. kembali`);
    rl.question('masukkan salah satu no. dari opsi di atas:', (answer) => {
        switch (answer) {
            case '1':
                daftarDosen(() => {
                    dosen();
                });
                break;
            case '2':
                cariDosen();
                break;
            case '3':
                tambahDosen();
                break;
            case '4':
                hapusDosen();
                break;
            case '5':
                mainMenu();
                break;
            default:
                console.log('anda salah memasukkan no. menu');
                dosen();
                break;
        }
    });
}

function daftarDosen(cb) {
    db.all(`select * from dosen`, (err, rows) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        table = new Table({
            head: ['ID', 'Nama'],
            colWidths: [20, 40]
        });
        rows.forEach((item) => {
            table.push([item.KODEDOSEN, item.NAMADOSEN]);
        })
        console.log(table.toString());
        cb();
    });
}

function cariDosen() {
    rl.question('Masukkan kode dosen:', (KODE) => {
        db.all(`select  * from dosen where dosen.KODEDOSEN = $KODE`, {
            $KODE: KODE
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {
                console.log(`
==============================================
DETAILS DOSEN
==============================================
Kode Dosen       : ${rows[0].KODEDOSEN}
Nama Dosen       : ${rows[0].NAMADOSEN}
==============================================
            `);
                dosen();
            } else {
                console.log(`dosen dengan NID ${KODE} tidak terdaftar`);
                cariDosen();
            }

        });
    });
}

function tambahDosen() {
    rl.question('NID: ', (nid) => {
        rl.question('Nama : ', (nama) => {
            const query = `INSERT INTO dosen (KODEDOSEN, NAMADOSEN) VALUES ('${nid}','${nama}')`;
            db.run(query, (err) => {
                if (err) throw err;
                console.log("berhasil di buat");
                dosen();
            });
        });
        dosen
    });
};

function hapusDosen() {
    rl.question('masukkan kode dosen yang akan dihapus:', (kode) => {
        db.all(`select * from dosen where dosen.KODEDOSEN = $KODE`, {
            $KODE: kode
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {
                db.run(`delete from dosen where dosen.KODEDOSEN = '${kode}'`, (err) => {
                    if (err) throw err;
                    console.log("berhasil di hapus");
                    dosen();
                })
            } else {
                console.log(`dosen dengan NID ${kode} tidak terdaftar`);
                hapusDosen();
            }
        });
    });
}


/** Mata Kuliah */
function Matakuliah() {
    console.log(`
==============================================
silahkan pilih opsi di bawah ini
[1]. daftar Matakuliah
[2]. cari Matakuliah
[3]. tambah Matakuliah
[4]. hapus Matakuliah
[5]. kembali`);
    rl.question('masukkan salah satu no. dari opsi di atas:', (answer) => {
        switch (answer) {
            case '1':
                daftarMatakuliah(() => {
                    Matakuliah();
                });
                break;
            case '2':
                cariMatakuliah();
                break;
            case '3':
                tambahMatakuliah();
                break;
            case '4':
                hapusMatakuliah();
                break;
            case '5':
                mainMenu();
                break;
            default:
                console.log('anda salah memasukkan no. menu');
                Matakuliah();
                break;
        }
    });
}

function daftarMatakuliah(cb) {
    db.all(`select * from matakuliah`, (err, rows) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        table = new Table({
            head: ['IDMK', 'NamaMK', 'SKS'],
            colWidths: [15, 30, 10]
        });
        rows.forEach((item) => {
            table.push([item.KODEMK, item.NAMAMK, item.SKS]);
        })
        console.log(table.toString());
        cb();
    });
}

function cariMatakuliah() {
    rl.question('Masukkan kode matakuliah:', (kode) => {
        db.all(`select * from matakuliah where matakuliah.KODEMK = $KODE`, {
            $KODE: kode
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {
                console.log(`
==============================================
DETAILS MATA KULIAH
==============================================
Kode Matakuliah    : ${rows[0].KODEMK}
Nama Matakuliah    : ${rows[0].NAMAMK}
SKS                : ${rows[0].SKS}
==============================================
            `);
                Matakuliah();
            } else {
                console.log(`matakuliah dengan kode MK ${kode} tidak terdaftar`);
                cariMatakuliah();
            }

        });
    });
}

function tambahMatakuliah() {
    rl.question('KODEMK: ', (kode) => {
        rl.question('NamaMK : ', (nama) => {
            rl.question('SKS : ', (sks) => {
                const query = `INSERT INTO matakuliah (KODEMK, NAMAMK, SKS) VALUES ('${kode}','${nama}','${sks}')`;
                db.run(query, (err) => {
                    if (err) throw err;
                    console.log("berhasil di buat");
                    Matakuliah();
                });
            });
        });
    });
};

function hapusMatakuliah() {
    rl.question('masukkan kode mata kuliah yang akan dihapus:', (kode) => {
        db.all(`select * from matakuliah where matakuliah.KODEMK = $KODE`, {
            $KODE: kode
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {
                db.run(`delete from matakuliah where matakuliah.KODEMK = '${kode}'`, (err) => {
                    if (err) throw err;
                    console.log("berhasil di hapus");
                    Matakuliah();
                })
            } else {
                console.log(`dosen dengan NID ${kode} tidak terdaftar`);
                hapusMatakuliah();
            }
        });
    });

}

/** kontrak MK */
function kontrak() {
    console.log(`
==============================================
silahkan pilih opsi di bawah ini
[1]. daftar kontrak
[2]. cari kontrak
[3]. tambah kontrak
[4]. hapus kontrak
[5]. kembali`);
    rl.question('masukkan salah satu no. dari opsi di atas:', (answer) => {
        switch (answer) {
            case '1':
                daftarKontrak();
                break;
            case '2':
                cariKontrak();
                break;
            case '3':
                tambahKontrak();
                break;
            case '4':
                hapusKontrak();
                break;
            case '5':
                mainMenu();
                break;
            default:
                console.log('anda salah memasukkan no. menu');
                kontrak();
                break;
        }
    });
}

function daftarKontrak() {
    db.all(`select * from kontrak`, (err, rows) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        table = new Table({
            head: ['ID', 'NIM', 'KodeMK', 'Kode Dosen', 'Nilai'],
            colWidths: [10, 20, 20, 20, 10]
        });
        rows.forEach((item) => {
            table.push([item.ID, item.NIM, item.KODEMK, item.KODEDOSEN, item.NILAI]);
        })
        console.log(table.toString());
        kontrak();
    });
}

function cariKontrak() {
    rl.question('Masukkan ID kontrak:', (kode) => {
        db.all(`select * from kontrak where kontrak.ID = $KODE`, {
            $KODE: kode
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {
                console.log(`
==============================================
DETAILS MATA KULIAH
==============================================
ID          : ${rows[0].ID}
NIM         : ${rows[0].NIM}
Kode MK     : ${rows[0].KODEMK}
Kode Dosen  : ${rows[0].KODEDOSEN}
Nilai       : ${rows[0].NILAI}
==============================================
            `);
                kontrak();
            } else {
                console.log(`kontrak dengan ID ${kode} tidak terdaftar`);
                cariKontrak();
            }

        });
    });
}

function tambahKontrak() {
    //rl.question('ID: ', (id) => {
    rl.question('NIM: ', (nim) => {
        daftarMatakuliah(() => {
            rl.question('Kode MK : ', (kodeMK) => {
                daftarDosen(() => {
                    rl.question('Kode Dosen : ', (kodeDosen) => {
                        rl.question('Nilai : ', (nilai) => {
                            const query = `INSERT INTO kontrak (ID, NIM, KODEMK, KODEDOSEN,NILAI ) VALUES (null,'${nim}','${kodeMK}','${kodeDosen}','${nilai}')`;
                            db.run(query, (err) => {
                                if (err) throw err;
                                console.log("berhasil di buat");
                                kontrak();

                            });
                        });
                    });
                });
            });
        });
    });
    //});
};

function hapusKontrak() {
    rl.question('masukkan ID kontrak yang akan dihapus:', (kode) => {
        db.all(`select * from kontrak where kontrak.ID = $KODE`, {
            $KODE: kode
        }, (err, rows) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            if (rows.length > 0) {
                db.run(`delete from kontrak where kontrak.ID = '${kode}'`, (err) => {
                    if (err) throw err;
                    console.log("berhasil di hapus");
                    kontrak();
                })
            } else {
                console.log(`kontrak dengan ID ${kode} tidak terdaftar`);
                hapusKontrak();
            }
        });
    });

}