import React from 'react';
import axios from 'axios';

const CancelOrderButton = ({ orderId, currentStatus, onCancelSuccess }) => {
  const handleCancelOrder = async () => {
    if (!orderId) return;

    const confirm = window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?");
    if (!confirm) return;

    try {
      const response = await axios.put(`http://localhost:5001/api/commands/${orderId}/cancel`);

      if (response.data.success) {
        alert("Commande annulée avec succès !");
        if (typeof onCancelSuccess === 'function') {
          onCancelSuccess();
        }
      } else {
        alert(response.data.message || "Erreur lors de l'annulation.");
      }

    } catch (error) {
      console.error("Erreur d'annulation :", error);
      alert("Erreur lors de l'annulation de la commande.");
    }
  };

  // N'affiche pas le bouton si le statut ne permet pas l'annulation
  if (currentStatus !== 'NOUVELLE') return null;

  return (
    <div className="mb-6">
      <button
        onClick={handleCancelOrder}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
      >
        Annuler la commande
      </button>
    </div>
  );
};

export default CancelOrderButton;
