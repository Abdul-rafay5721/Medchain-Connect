const MedicalRecordsList = ({ records }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Medical Records</h3>
      <div className="space-y-2">
        {records.map(record => (
          <div key={record.id} className="p-3 border rounded">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{record.title}</p>
                <p className="text-sm text-gray-500">Date: {record.date}</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecordsList;
