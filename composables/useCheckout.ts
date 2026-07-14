import { ref } from 'vue'

export const useCheckout = () => {
  // Global singleton state using useState so it persists across components automatically
  const billingDetails = useState('billingDetails', () => ({
    fullName: '',
    phone: '',
    address: '',
    npwp: '',
    nik: '',
    email: '',
    vesselName: '',
    vesselId: ''
  }))

  const isValid = () => {
    // Basic validation requiring Name, Phone, Address, Email
    return (
      billingDetails.value.fullName.trim() !== '' &&
      billingDetails.value.phone.trim() !== '' &&
      billingDetails.value.address.trim() !== '' &&
      billingDetails.value.email.trim() !== ''
    )
  }

  return {
    billingDetails,
    isValid
  }
}
