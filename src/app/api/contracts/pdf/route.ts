import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Contract from '@/models/Contract';
import User from '@/models/User';
import Company from '@/models/Company';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export async function GET(request: Request) {
  await dbConnect();

  // Ensure models are registered
  try {
    require('@/models/User');
    require('@/models/Company');
    require('@/models/Contract');
  } catch (error) {
    console.log('Models already registered');
  }

  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const userId = searchParams.get('userId');

    if (!contractId) {
      return NextResponse.json({ success: false, error: 'Contract ID is required' }, { status: 400 });
    }

    // Find the contract first
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return NextResponse.json({ success: false, error: 'Contract not found' }, { status: 404 });
    }

    // Check if the requesting user has access to this contract
    if (userId && contract.employee.toString() !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    // Get employee details
    const employee = await User.findById(contract.employee);
    
    // Get company details if exists
    let company = null;
    if (contract.company) {
      company = await Company.findById(contract.company);
    }

    // Generate PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Employment Contract Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Company Information
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Company Information:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    if (company) {
      pdf.text(`Company Name: ${company.name}`, margin, yPosition);
      yPosition += 7;
      if (company.address) {
        pdf.text(`Address: ${company.address}`, margin, yPosition);
        yPosition += 7;
      }
      if (company.email) {
        pdf.text(`Email: ${company.email}`, margin, yPosition);
        yPosition += 7;
      }
      if (company.phone) {
        pdf.text(`Phone: ${company.phone}`, margin, yPosition);
        yPosition += 7;
      }
    } else {
      pdf.text('Company information not available', margin, yPosition);
      yPosition += 7;
    }
    yPosition += 10;

    // Employee Information
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Employee Information:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    if (employee) {
      pdf.text(`Name: ${employee.name}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Email: ${employee.email}`, margin, yPosition);
      yPosition += 7;
      if (employee.phone) {
        pdf.text(`Phone: ${employee.phone}`, margin, yPosition);
        yPosition += 7;
      }
      if (employee.address) {
        pdf.text(`Address: ${employee.address}`, margin, yPosition);
        yPosition += 7;
      }
    } else {
      pdf.text('Employee information not available', margin, yPosition);
      yPosition += 7;
    }
    yPosition += 10;

    // Contract Details
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Contract Details:', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Contract Type: ${contract.type}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Status: ${contract.status}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Start Date: ${format(new Date(contract.startDate), 'PPP')}`, margin, yPosition);
    yPosition += 7;
    if (contract.endDate) {
      pdf.text(`End Date: ${format(new Date(contract.endDate), 'PPP')}`, margin, yPosition);
      yPosition += 7;
    }
    if (contract.lastStatusUpdate) {
      pdf.text(`Last Updated: ${format(new Date(contract.lastStatusUpdate), 'PPP')}`, margin, yPosition);
      yPosition += 7;
    }
    yPosition += 10;

    // Status History
    if (contract.statusHistory && contract.statusHistory.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Status History:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      contract.statusHistory.forEach((history: any, index: number) => {
        if (yPosition > 250) { // Add new page if needed
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.text(`${index + 1}. ${format(new Date(history.updatedAt), 'PPP')}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`   Status: ${history.previousStatus} → ${history.status}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`   Reason: ${history.reason}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`   Updated by: ${history.updatedBy}`, margin, yPosition);
        yPosition += 10;
      });
    }

    // Documents
    if (contract.documents && contract.documents.length > 0) {
      if (yPosition > 200) { // Add new page if needed
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Associated Documents:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      contract.documents.forEach((doc: any, index: number) => {
        pdf.text(`${index + 1}. ${doc.fileName}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`   Uploaded: ${format(new Date(doc.uploadDate), 'PPP')}`, margin, yPosition);
        yPosition += 10;
      });
    }

    // Footer
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated on ${format(new Date(), 'PPP')} - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pdf.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Convert PDF to buffer
    const pdfArrayBuffer = pdf.output('arraybuffer');

    // Set response headers for PDF download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="contract_${contract._id}_${format(new Date(), 'yyyy-MM-dd')}.pdf"`);

    return new Response(pdfArrayBuffer, { headers });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate PDF' }, { status: 500 });
  }
}
