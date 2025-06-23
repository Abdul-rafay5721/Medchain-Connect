const PatientList = ({ patients, onPatientSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Patient List</h3>
      <div className="space-y-2">
        {patients.map(patient => (
          <div
            key={patient.id}
            className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => onPatientSelect(patient)}
          >
            <p className="font-medium">{patient.name}</p>
            <p className="text-sm text-gray-500">ID: {patient.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientList;
