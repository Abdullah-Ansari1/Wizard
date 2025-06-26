class StepperForm {
  constructor() {
    this.currentStep = 1
    this.totalSteps = 4
    this.formData = {}

    this.init()
  }

  init() {
    this.bindEvents()
    this.loadSavedData()
    this.updateUI()
  }

  bindEvents() {
    // Navigation buttons
    document.getElementById("nextBtn").addEventListener("click", () => this.nextStep())
    document.getElementById("prevBtn").addEventListener("click", () => this.prevStep())
    document.getElementById("submitBtn").addEventListener("click", (e) => this.submitForm(e))

    // Form inputs - save data on change
    const form = document.getElementById("stepperForm")
    form.addEventListener("input", (e) => this.saveFormData(e))
    form.addEventListener("change", (e) => this.saveFormData(e))

    // Modal close
    document.querySelector(".close").addEventListener("click", () => this.closeModal())
    document.getElementById("successModal").addEventListener("click", (e) => {
      if (e.target.id === "successModal") this.closeModal()
    })

    // Document download buttons
    document.getElementById("downloadPDF").addEventListener("click", () => this.downloadPDF())
    document.getElementById("downloadJSON").addEventListener("click", () => this.downloadJSON())
    document.getElementById("downloadDOCX").addEventListener("click", () => this.downloadDOCX())

    // Real-time validation
    const requiredInputs = form.querySelectorAll("input[required], select[required]")
    requiredInputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input))
    })
  }

  saveFormData(e) {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      if (name === "interests") {
        if (!this.formData.interests) this.formData.interests = []
        if (checked) {
          if (!this.formData.interests.includes(value)) {
            this.formData.interests.push(value)
          }
        } else {
          this.formData.interests = this.formData.interests.filter((item) => item !== value)
        }
      } else {
        this.formData[name] = checked
      }
    } else {
      this.formData[name] = value
    }

    // Save to localStorage
    localStorage.setItem("stepperFormData", JSON.stringify(this.formData))
  }

  loadSavedData() {
    const savedData = localStorage.getItem("stepperFormData")
    if (savedData) {
      this.formData = JSON.parse(savedData)
      this.populateForm()
    }
  }

  populateForm() {
    Object.keys(this.formData).forEach((key) => {
      const element = document.querySelector(`[name="${key}"]`)
      if (element) {
        if (element.type === "checkbox") {
          if (key === "interests" && Array.isArray(this.formData[key])) {
            const checkboxes = document.querySelectorAll(`[name="${key}"]`)
            checkboxes.forEach((cb) => {
              cb.checked = this.formData[key].includes(cb.value)
            })
          } else {
            element.checked = this.formData[key]
          }
        } else {
          element.value = this.formData[key]
        }
      }
    })
  }

  validateField(field) {
    const errorElement = field.parentNode.querySelector(".error-message")
    let isValid = true
    let errorMessage = ""

    if (field.hasAttribute("required") && !field.value.trim()) {
      isValid = false
      errorMessage = "This field is required"
    } else if (field.type === "email" && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(field.value)) {
        isValid = false
        errorMessage = "Please enter a valid email address"
      }
    }

    if (errorElement) {
      errorElement.textContent = errorMessage
    }

    field.classList.toggle("error", !isValid)
    return isValid
  }

  validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`)
    const requiredFields = currentStepElement.querySelectorAll("input[required], select[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false
      }
    })

    // Special validation for step 4 (terms agreement)
    if (this.currentStep === 4) {
      const agreeTerms = document.getElementById("agreeTerms")
      if (!agreeTerms.checked) {
        isValid = false
        const errorElement = agreeTerms.parentNode.parentNode.querySelector(".error-message")
        if (errorElement) {
          errorElement.textContent = "You must agree to the terms and conditions"
        }
      }
    }

    return isValid
  }

  nextStep() {
    if (!this.validateCurrentStep()) {
      return
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++
      this.updateUI()

      if (this.currentStep === 4) {
        this.populateReview()
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--
      this.updateUI()
    }
  }

  updateUI() {
    // Update form steps visibility
    document.querySelectorAll(".form-step").forEach((step) => {
      step.classList.remove("active")
    })
    document.querySelector(`.form-step[data-step="${this.currentStep}"]`).classList.add("active")

    // Update progress bar
    document.querySelectorAll(".progress-step").forEach((step, index) => {
      step.classList.remove("active", "completed")
      if (index + 1 === this.currentStep) {
        step.classList.add("active")
      } else if (index + 1 < this.currentStep) {
        step.classList.add("completed")
      }
    })

    // Update navigation buttons
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")
    const submitBtn = document.getElementById("submitBtn")

    prevBtn.style.display = this.currentStep === 1 ? "none" : "block"
    nextBtn.style.display = this.currentStep === this.totalSteps ? "none" : "block"
    submitBtn.style.display = this.currentStep === this.totalSteps ? "block" : "none"
  }

  populateReview() {
    const reviewContent = document.getElementById("reviewContent")
    const sections = [
      {
        title: "Personal Information",
        fields: [
          { key: "firstName", label: "First Name" },
          { key: "lastName", label: "Last Name" },
          { key: "dateOfBirth", label: "Date of Birth" },
          { key: "gender", label: "Gender" },
        ],
      },
      {
        title: "Contact Details",
        fields: [
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          { key: "city", label: "City" },
          { key: "state", label: "State/Province" },
          { key: "zipCode", label: "ZIP Code" },
          { key: "country", label: "Country" },
        ],
      },
      {
        title: "Additional Information",
        fields: [
          { key: "occupation", label: "Occupation" },
          { key: "company", label: "Company" },
          { key: "experience", label: "Experience" },
          { key: "skills", label: "Skills" },
          { key: "interests", label: "Interests" },
          { key: "comments", label: "Comments" },
        ],
      },
    ]

    let html = ""
    sections.forEach((section) => {
      html += `<div class="review-section">
                <h4>${section.title}</h4>`

      section.fields.forEach((field) => {
        let value = this.formData[field.key]
        if (value) {
          if (Array.isArray(value)) {
            value = value.join(", ")
          }
          html += `<div class="review-item">
                        <span class="review-label">${field.label}:</span>
                        <span class="review-value">${value}</span>
                    </div>`
        }
      })

      html += "</div>"
    })

    reviewContent.innerHTML = html
  }

  async submitForm(e) {
    e.preventDefault()

    if (!this.validateCurrentStep()) {
      return
    }

    // Simulate form submission
    const submitBtn = document.getElementById("submitBtn")
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Submitting..."
    submitBtn.disabled = true

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Clear saved data
      localStorage.removeItem("stepperFormData")

      // Show success modal
      this.showModal()
    } catch (error) {
      alert("An error occurred while submitting the form. Please try again.")
    } finally {
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }
  }

  showModal() {
    document.getElementById("successModal").style.display = "block"
  }

  closeModal() {
    document.getElementById("successModal").style.display = "none"
  }

  downloadPDF() {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Form Submission Document", 20, 30)

    // Add submission date
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)

    let yPosition = 65
    const lineHeight = 8

    // Add form data
    Object.keys(this.formData).forEach((key) => {
      if (this.formData[key] && this.formData[key] !== "") {
        const label = this.formatLabel(key)
        let value = this.formData[key]

        if (Array.isArray(value)) {
          value = value.join(", ")
        }

        // Handle long text
        const text = `${label}: ${value}`
        const splitText = doc.splitTextToSize(text, 170)

        splitText.forEach((line) => {
          if (yPosition > 280) {
            doc.addPage()
            yPosition = 20
          }
          doc.text(line, 20, yPosition)
          yPosition += lineHeight
        })

        yPosition += 3 // Extra space between fields
      }
    })

    // Save the PDF
    doc.save("form-submission.pdf")
  }

  downloadJSON() {
    const dataStr = JSON.stringify(this.formData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = "form-data.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  async downloadDOCX() {
    // Show loading state immediately
    const downloadBtn = document.getElementById("downloadDOCX")
    const originalText = downloadBtn.textContent
    downloadBtn.textContent = "Loading..."
    downloadBtn.disabled = true

    try {
      // Wait for docx library to be ready
      const isDocxReady = await window.docxReady

      const docx = window.docx // Declare the docx variable here

      if (!isDocxReady || typeof docx === "undefined") {
        // Fallback: Create a simple Word-compatible document
        this.downloadWordFallback()
        return
      }

      downloadBtn.textContent = "Generating..."

      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx

      const children = []

      // Add title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Form Submission Document",
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      )

      // Add submission date
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date().toLocaleDateString()}`,
              italics: true,
            }),
          ],
          spacing: { after: 400 },
        }),
      )

      // Define sections for organized output
      const sections = [
        {
          title: "Personal Information",
          fields: [
            { key: "firstName", label: "First Name" },
            { key: "lastName", label: "Last Name" },
            { key: "dateOfBirth", label: "Date of Birth" },
            { key: "gender", label: "Gender" },
          ],
        },
        {
          title: "Contact Details",
          fields: [
            { key: "email", label: "Email Address" },
            { key: "phone", label: "Phone Number" },
            { key: "address", label: "Street Address" },
            { key: "city", label: "City" },
            { key: "state", label: "State/Province" },
            { key: "zipCode", label: "ZIP/Postal Code" },
            { key: "country", label: "Country" },
          ],
        },
        {
          title: "Additional Information",
          fields: [
            { key: "occupation", label: "Occupation" },
            { key: "company", label: "Company/Organization" },
            { key: "experience", label: "Years of Experience" },
            { key: "skills", label: "Skills" },
            { key: "interests", label: "Interests" },
            { key: "comments", label: "Additional Comments" },
          ],
        },
      ]

      // Add each section
      sections.forEach((section) => {
        // Add section heading
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.title,
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
        )

        // Add fields for this section
        section.fields.forEach((field) => {
          const value = this.formData[field.key]
          if (value && value !== "") {
            let displayValue = value
            if (Array.isArray(value)) {
              displayValue = value.join(", ")
            }

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${field.label}: `,
                    bold: true,
                  }),
                  new TextRun({
                    text: displayValue.toString(),
                  }),
                ],
                spacing: { after: 100 },
              }),
            )
          }
        })
      })

      // Add preferences section if applicable
      if (this.formData.agreeTerms || this.formData.subscribeNewsletter) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Preferences",
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
        )

        if (this.formData.agreeTerms) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "✓ Agreed to Terms and Conditions",
                }),
              ],
              spacing: { after: 100 },
            }),
          )
        }

        if (this.formData.subscribeNewsletter) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "✓ Subscribed to Newsletter",
                }),
              ],
              spacing: { after: 100 },
            }),
          )
        }
      }

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      })

      // Generate and download the document
      const blob = await Packer.toBlob(doc)

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "form-submission.docx"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating DOCX:", error)
      // Fallback to simple Word document
      this.downloadWordFallback()
    } finally {
      // Restore button state
      downloadBtn.textContent = originalText
      downloadBtn.disabled = false
    }
  }

  // Fallback method that creates a Word-compatible RTF document
  downloadWordFallback() {
    console.log("Using Word fallback method")

    // Create RTF content (Rich Text Format - compatible with Word)
    let rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 
{\\b\\fs32 Form Submission Document}\\par
\\par
{\\i Generated on: ${new Date().toLocaleDateString()}}\\par
\\par
`

    // Define sections
    const sections = [
      {
        title: "Personal Information",
        fields: [
          { key: "firstName", label: "First Name" },
          { key: "lastName", label: "Last Name" },
          { key: "dateOfBirth", label: "Date of Birth" },
          { key: "gender", label: "Gender" },
        ],
      },
      {
        title: "Contact Details",
        fields: [
          { key: "email", label: "Email Address" },
          { key: "phone", label: "Phone Number" },
          { key: "address", label: "Street Address" },
          { key: "city", label: "City" },
          { key: "state", label: "State/Province" },
          { key: "zipCode", label: "ZIP/Postal Code" },
          { key: "country", label: "Country" },
        ],
      },
      {
        title: "Additional Information",
        fields: [
          { key: "occupation", label: "Occupation" },
          { key: "company", label: "Company/Organization" },
          { key: "experience", label: "Years of Experience" },
          { key: "skills", label: "Skills" },
          { key: "interests", label: "Interests" },
          { key: "comments", label: "Additional Comments" },
        ],
      },
    ]

    // Add each section to RTF
    sections.forEach((section) => {
      rtfContent += `{\\b\\fs28 ${section.title}}\\par\\par`

      section.fields.forEach((field) => {
        const value = this.formData[field.key]
        if (value && value !== "") {
          let displayValue = value
          if (Array.isArray(value)) {
            displayValue = value.join(", ")
          }

          // Escape special RTF characters
          displayValue = displayValue.toString().replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}")

          rtfContent += `{\\b ${field.label}:} ${displayValue}\\par`
        }
      })

      rtfContent += "\\par"
    })

    // Add preferences if applicable
    if (this.formData.agreeTerms || this.formData.subscribeNewsletter) {
      rtfContent += `{\\b\\fs28 Preferences}\\par\\par`

      if (this.formData.agreeTerms) {
        rtfContent += "✓ Agreed to Terms and Conditions\\par"
      }

      if (this.formData.subscribeNewsletter) {
        rtfContent += "✓ Subscribed to Newsletter\\par"
      }
    }

    rtfContent += "}"

    // Create and download RTF file
    const blob = new Blob([rtfContent], { type: "application/rtf" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "form-submission.rtf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)

    alert(
      "Generated RTF document (compatible with Microsoft Word). The DOCX library couldn't load, so we created an RTF file instead.",
    )
  }

  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }
}

// Initialize the stepper form when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new StepperForm()
})

// Add some utility functions for enhanced functionality
window.StepperFormUtils = {
  // Add custom field dynamically
  addCustomField: function (stepNumber, fieldConfig) {
    const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`)
    if (step) {
      const fieldHTML = this.generateFieldHTML(fieldConfig)
      step.insertAdjacentHTML("beforeend", fieldHTML)
    }
  },

  // Generate HTML for different field types
  generateFieldHTML: (config) => {
    const { type, name, label, required, options } = config
    let html = `<div class="form-group">
            <label for="${name}">${label}${required ? " *" : ""}</label>`

    switch (type) {
      case "text":
      case "email":
      case "tel":
      case "date":
        html += `<input type="${type}" id="${name}" name="${name}" ${required ? "required" : ""}>`
        break
      case "textarea":
        html += `<textarea id="${name}" name="${name}" rows="3" ${required ? "required" : ""}></textarea>`
        break
      case "select":
        html += `<select id="${name}" name="${name}" ${required ? "required" : ""}>
                    <option value="">Select ${label}</option>`
        options.forEach((option) => {
          html += `<option value="${option.value}">${option.text}</option>`
        })
        html += "</select>"
        break
    }

    html += '<span class="error-message"></span></div>'
    return html
  },

  // Export form data in different formats
  exportData: function (format = "json") {
    const formData = JSON.parse(localStorage.getItem("stepperFormData") || "{}")

    switch (format) {
      case "csv":
        return this.convertToCSV(formData)
      case "xml":
        return this.convertToXML(formData)
      case "docx":
        return this.convertToDOCX(formData)
      default:
        return JSON.stringify(formData, null, 2)
    }
  },

  convertToCSV: (data) => {
    const headers = Object.keys(data)
    const values = Object.values(data).map((val) => (Array.isArray(val) ? val.join(";") : val))

    return headers.join(",") + "\n" + values.join(",")
  },

  convertToXML: (data) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<formData>\n'

    Object.keys(data).forEach((key) => {
      let value = data[key]
      if (Array.isArray(value)) {
        value = value.join(", ")
      }
      xml += `  <${key}>${value}</${key}>\n`
    })

    xml += "</formData>"
    return xml
  },

  convertToDOCX: async (data) => {
    const docx = window.docx // Declare the docx variable here
    const { Document, Packer, Paragraph, TextRun } = docx

    const children = Object.keys(data).map((key) => {
      let value = data[key]
      if (Array.isArray(value)) {
        value = value.join(", ")
      }

      return new Paragraph({
        children: [
          new TextRun({
            text: `${key}: ${value}`,
          }),
        ],
      })
    })

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    })

    return await Packer.toBlob(doc)
  },
}
