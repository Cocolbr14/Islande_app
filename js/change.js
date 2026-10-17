// =========================================================================
// CONVERTISSEUR MONNAIE
// =========================================================================
const RATE = 150;
function convertCurrency(source) {
  if (source === 'isk') {
    const val = parseFloat(document.getElementById('iskInput').value) || 0;
    document.getElementById('eurInput').value = (val / RATE).toFixed(2);
  } else {
    const val = parseFloat(document.getElementById('eurInput').value) || 0;
    document.getElementById('iskInput').value = Math.round(val * RATE);
  }
}
