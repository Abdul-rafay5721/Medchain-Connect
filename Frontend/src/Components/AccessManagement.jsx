const AccessManagement = ({ permissions, onGrantAccess, onRevokeAccess }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Access Management</h3>
      <div className="space-y-4">
        {permissions.map(permission => (
          <div key={permission.id} className="p-3 border rounded">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{permission.provider}</p>
                <p className="text-sm text-gray-500">
                  Expires: {permission.expiryDate}
                </p>
              </div>
              <button
                onClick={() => onRevokeAccess(permission.id)}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm"
              >
                Revoke Access
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessManagement;
