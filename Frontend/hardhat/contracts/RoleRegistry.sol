// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RoleRegistry {
    enum Role { None, Patient, Provider }

    struct Patient {
        string name;
        uint age;
        string bloodGroup;
        string contactNumber;
    }

    struct Provider {
        string name;
        string hospital;
        string specialization;
        string licenseNumber;
        string contactNumber;
    }

    mapping(address => Role) public userRoles;
    mapping(address => Patient) public patients;
    mapping(address => Provider) public providers;

    function registerPatient(
        string memory _name,
        uint _age,
        string memory _bloodGroup,
        string memory _contactNumber
    ) public {
        require(userRoles[msg.sender] == Role.None, "Already registered");
        patients[msg.sender] = Patient(_name, _age, _bloodGroup, _contactNumber);
        userRoles[msg.sender] = Role.Patient;
    }

    function registerProvider(
        string memory _name,
        string memory _hospital,
        string memory _specialization,
        string memory _licenseNumber,
        string memory _contactNumber
    ) public {
        require(userRoles[msg.sender] == Role.None, "Already registered");
        providers[msg.sender] = Provider(_name, _hospital, _specialization, _licenseNumber, _contactNumber);
        userRoles[msg.sender] = Role.Provider;
    }

    function getUserRole(address user) public view returns (string memory) {
        if (userRoles[user] == Role.Patient) return "patient";
        if (userRoles[user] == Role.Provider) return "provider";
        return "";
    }

    function getPatientInfo(address user) public view returns (
        string memory name,
        uint age,
        string memory bloodGroup,
        string memory contactNumber
    ) {
        require(userRoles[user] == Role.Patient, "Not a patient");
        Patient storage p = patients[user];
        return (p.name, p.age, p.bloodGroup, p.contactNumber);
    }

    function getProviderInfo(address user) public view returns (
        string memory name,
        string memory hospital,
        string memory specialization,
        string memory licenseNumber,
        string memory contactNumber
    ) {
        require(userRoles[user] == Role.Provider, "Not a provider");
        Provider storage p = providers[user];
        return (p.name, p.hospital, p.specialization, p.licenseNumber, p.contactNumber);
    }
}
