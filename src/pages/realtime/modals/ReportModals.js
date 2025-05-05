import React from 'react';

const ReportModal = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{report.category.replace(/_/g, ' ')}</h2>
        <p><strong>Reported by:</strong> {report.reported_by}</p>
        <p><strong>Report Time:</strong> {report.time}</p>
        <p><strong>Location:</strong> Lat: {report.location.Lat}, Long: {report.location.Lng}</p>
        {report.species && <p><strong>Species:</strong> {report.species}</p>}
        {report.cause_of_injury && <p><strong>Cause of Injury:</strong> {report.cause_of_injury}</p>}
        {report.cause_of_fire && <p><strong>Fire Cause:</strong> {report.cause_of_fire}</p>}
        <p><strong>Action Taken:</strong> {report.action_taken}</p>
        <p><strong>Notes:</strong> {report.notes}</p>
        {report.pictures && (
          <div>
            <h3>Attached Images</h3>
            {report.pictures.map((img, index) => (
              <img key={index} src={img} alt="Attached" className="attached-image" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;