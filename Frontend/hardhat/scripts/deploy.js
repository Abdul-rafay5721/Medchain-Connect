async function main() {
  const [deployer] = await ethers.getSigners();

  const Registry = await ethers.getContractFactory("RoleRegistry");
  const registry = await Registry.deploy();

  console.log("Contract deployed to:", registry.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
