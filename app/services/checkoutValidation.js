const InputError = require("../errors/inputError");

module.exports = (details) => {
  const errors = [];

  for (const field of ["country", "address", "postalCode"])
    if (
      typeof details[field] !== "string" ||
      !details[field].trim() ||
      details[field].trim().length > 50
    )
      errors.push(
        new InputError(
          field,
          "Complete the delivery address (maximum 50 characters per field).",
        ),
      );

  if (details.country === "Spain" && !/^\d{5}$/.test(details.postalCode || ""))
    errors.push(
      new InputError("postalCode", "Enter a five-digit postal code."),
    );

  if (
    !Number.isSafeInteger(Number(details.buyerPaymentId)) ||
    Number(details.buyerPaymentId) <= 0
  )
    errors.push(
      new InputError("buyerPaymentId", "Choose a valid payment card."),
    );
    
  if (errors.length) throw errors;

  return {
    ...details,
    country: details.country.trim(),
    address: details.address.trim(),
    postalCode: details.postalCode.trim(),
  };
};
