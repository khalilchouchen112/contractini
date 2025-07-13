import dbConnect from './dbConnect';
import Contract from '@/models/Contract';

export interface ContractStatusUpdate {
  contractId: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
  updatedAt: Date;
}

export class ContractStatusService {
  private static readonly STATUS_THRESHOLDS = {
    EXPIRING_SOON_DAYS: 30, // Contracts expiring within 30 days
    EXPIRED_GRACE_DAYS: 0,   // Contracts past end date
  };

  /**
   * Calculate the appropriate status for a contract based on its dates
   */
  static calculateContractStatus(startDate: string, endDate?: string): string {
    const now = new Date();
    const start = new Date(startDate);
    
    // If contract hasn't started yet
    if (start > now) {
      return 'Pending'; // You might want to add this status
    }

    // If no end date, it's a permanent contract (CDI)
    if (!endDate) {
      return 'Active';
    }

    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Contract has expired
    if (diffDays < this.STATUS_THRESHOLDS.EXPIRED_GRACE_DAYS) {
      return 'Expired';
    }

    // Contract is expiring soon
    if (diffDays <= this.STATUS_THRESHOLDS.EXPIRING_SOON_DAYS) {
      return 'Expiring Soon';
    }

    // Contract is active
    return 'Active';
  }

  /**
   * Update all contract statuses based on current date
   */
  static async updateAllContractStatuses(): Promise<ContractStatusUpdate[]> {
    try {
      await dbConnect();
      
      // Get all non-terminated contracts
      const contracts = await Contract.find({
        status: { $ne: 'Terminated' }
      }).populate('employee', 'name email');

      const updates: ContractStatusUpdate[] = [];
      const bulkOperations: any[] = [];

      for (const contract of contracts) {
        const currentStatus = contract.status;
        const newStatus = this.calculateContractStatus(contract.startDate, contract.endDate);

        // Only update if status has changed
        if (currentStatus !== newStatus) {
          const update: ContractStatusUpdate = {
            contractId: contract._id.toString(),
            oldStatus: currentStatus,
            newStatus: newStatus,
            reason: this.getStatusChangeReason(currentStatus, newStatus, contract.endDate),
            updatedAt: new Date()
          };

          updates.push(update);

          // Prepare bulk update operation
          bulkOperations.push({
            updateOne: {
              filter: { _id: contract._id },
              update: { 
                status: newStatus,
                lastStatusUpdate: new Date(),
                statusHistory: {
                  $push: {
                    status: newStatus,
                    previousStatus: currentStatus,
                    updatedAt: new Date(),
                    reason: update.reason,
                    updatedBy: 'system'
                  }
                }
              }
            }
          });
        }
      }

      // Execute bulk updates if there are any
      if (bulkOperations.length > 0) {
        await Contract.bulkWrite(bulkOperations);
        console.log(`Updated ${bulkOperations.length} contract statuses`);
      }

      return updates;
    } catch (error) {
      console.error('Error updating contract statuses:', error);
      throw error;
    }
  }

  /**
   * Get a human-readable reason for status change
   */
  private static getStatusChangeReason(oldStatus: string, newStatus: string, endDate?: string): string {
    if (newStatus === 'Expired') {
      return `Contract expired on ${endDate ? new Date(endDate).toLocaleDateString() : 'unknown date'}`;
    }
    
    if (newStatus === 'Expiring Soon') {
      const daysUntilExpiry = endDate ? 
        Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return `Contract expires in ${daysUntilExpiry} days`;
    }

    if (newStatus === 'Active' && oldStatus === 'Expiring Soon') {
      return 'Contract end date was extended';
    }

    return `Status changed from ${oldStatus} to ${newStatus}`;
  }

  /**
   * Get contracts that are expiring soon
   */
  static async getExpiringContracts(days: number = 30): Promise<any[]> {
    try {
      await dbConnect();
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const contracts = await Contract.find({
        status: { $in: ['Active', 'Expiring Soon'] },
        endDate: {
          $exists: true,
          $ne: null,
          $lte: futureDate,
          $gte: new Date()
        }
      }).populate('employee', 'name email').sort({ endDate: 1 });

      return contracts;
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      throw error;
    }
  }

  /**
   * Get expired contracts
   */
  static async getExpiredContracts(): Promise<any[]> {
    try {
      await dbConnect();
      
      const contracts = await Contract.find({
        status: 'Expired',
        endDate: {
          $exists: true,
          $ne: null,
          $lt: new Date()
        }
      }).populate('employee', 'name email').sort({ endDate: -1 });

      return contracts;
    } catch (error) {
      console.error('Error fetching expired contracts:', error);
      throw error;
    }
  }

  /**
   * Update a single contract's status
   */
  static async updateSingleContractStatus(contractId: string): Promise<ContractStatusUpdate | null> {
    try {
      await dbConnect();
      
      const contract = await Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      const currentStatus = contract.status;
      const newStatus = this.calculateContractStatus(contract.startDate, contract.endDate);

      if (currentStatus !== newStatus) {
        await Contract.findByIdAndUpdate(contractId, {
          status: newStatus,
          lastStatusUpdate: new Date()
        });

        return {
          contractId,
          oldStatus: currentStatus,
          newStatus,
          reason: this.getStatusChangeReason(currentStatus, newStatus, contract.endDate),
          updatedAt: new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('Error updating single contract status:', error);
      throw error;
    }
  }
}
