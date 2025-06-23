async function main() {
  const [deployer] = await ethers.getSigners();

  const MedicalRecordsStorage = await ethers.getContractFactory("MedicalRecordsStorage");
  const medicalRecordsStorage = await MedicalRecordsStorage.deploy();

  console.log("MedicalRecordsStorage deployed to:", medicalRecordsStorage.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
