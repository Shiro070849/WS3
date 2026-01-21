const wayInService = require('../service/wayin.service');

class WayInController {
  // สร้างข้อมูลการเข้า
  async create(req, res) {
    try {
      // Log request body for debugging
      console.log('Received request body:', JSON.stringify(req.body, null, 2));
      console.log('Request headers:', req.headers);

      const data = {
        barcode: req.body.barcode,
        cardId: req.body.cardId,
        fullName: req.body.fullName,
        gender: req.body.gender,
        address: req.body.address,
        licensePlate: req.body.licensePlate,
        licenseProvince: req.body.licenseProvince,
        vehicleType: req.body.vehicleType,
        internalDivision: req.body.internalDivision,
        follower: req.body.follower,
        remarks: req.body.remarks,
        systemUserId: req.body.systemUserId,
        recordedOn: req.body.recordedOn,
        icId: req.body.icId,
        idId: req.body.idId,
        vtId: req.body.vtId,
        fromCompany: req.body.fromCompany,
        images: req.body.images,
        contactName: req.body.contactName,
        suIdInternal: req.body.suIdInternal,
        suIdInternalRecordedOn: req.body.suIdInternalRecordedOn,
        suIdInternalRemark: req.body.suIdInternalRemark,
        device: req.body.device
      };

      console.log('Parsed systemUserId:', data.systemUserId, 'Type:', typeof data.systemUserId);

      // Validate required fields
      if (!data.systemUserId) {
        console.log('Validation failed: systemUserId is missing or invalid');
        return res.status(400).json({
          success: false,
          message: 'System User ID is required',
          debug: {
            receivedBody: req.body,
            systemUserId: data.systemUserId
          }
        });
      }

      // Set default values for required fields
      if (!data.barcode) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        data.barcode = `WI${timestamp}${random}`;
        console.log('Auto-generated barcode:', data.barcode);
      }

      // Set default value for follower (0 if not provided)
      if (data.follower === undefined || data.follower === null) {
        data.follower = 0;
        console.log('Set default follower to 0');
      }

      // Set default value for cardId (0 if not provided)
      if (data.cardId === undefined || data.cardId === null) {
        data.cardId = 0;
        console.log('Set default cardId to 0');
      }

      console.log('Final data before insert:', JSON.stringify(data, null, 2));

      const result = await wayInService.createWayIn(data);

      res.status(201).json({
        success: true,
        message: 'Way In record created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in WayIn create:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating Way In record',
        error: error.message
      });
    }
  }

  // ดึงข้อมูลการเข้าตาม ID
  async getById(req, res) {
    try {
      const id = req.params.id;
      const result = await wayInService.getWayInById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Way In record not found'
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in WayIn getById:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting Way In record',
        error: error.message
      });
    }
  }

  // ดึงรายการผู้ที่เข้ามาแล้วยังไม่ออก
  async getActiveVisitors(req, res) {
    try {
      const result = await wayInService.getActiveVisitors();

      res.status(200).json({
        success: true,
        count: result.length,
        data: result
      });
    } catch (error) {
      console.error('Error in WayIn getActiveVisitors:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting active visitors',
        error: error.message
      });
    }
  }

  // ดึงรายการการเข้าทั้งหมด
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await wayInService.getAllWayIn(page, limit);

      res.status(200).json({
        success: true,
        page: page,
        limit: limit,
        count: result.length,
        data: result
      });
    } catch (error) {
      console.error('Error in WayIn getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting Way In records',
        error: error.message
      });
    }
  }

  // ค้นหาด้วย Barcode (สำหรับรีปริ้น)
  async searchByBarcode(req, res) {
    try {
      const barcode = req.params.barcode;
      const result = await wayInService.searchByBarcode(barcode);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบรายการที่ค้นหา'
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in WayIn searchByBarcode:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching by barcode',
        error: error.message
      });
    }
  }

  // อัพเดทข้อมูล WayIn (สำหรับรีปริ้น)
  async update(req, res) {
    try {
      const id = req.params.id;
      const data = {
        fullName: req.body.fullName,
        cardId: req.body.cardId,
        gender: req.body.gender,
        address: req.body.address,
        licensePlate: req.body.licensePlate,
        licenseProvince: req.body.licenseProvince,
        vehicleType: req.body.vehicleType,
        visitTypeId: req.body.visitTypeId,
        internalDivision: req.body.internalDivision,
        follower: req.body.follower,
        remarks: req.body.remarks,
        fromCompany: req.body.fromCompany,
        contactName: req.body.contactName
      };

      const result = await wayInService.updateWayIn(id, data);

      res.status(200).json({
        success: true,
        message: 'อัพเดทข้อมูลสำเร็จ',
        data: result
      });
    } catch (error) {
      console.error('Error in WayIn update:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating Way In record',
        error: error.message
      });
    }
  }

  // ดึงข้อมูลทั้งหมด (สำหรับรีปริ้น)
  async getAll(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 1000;
      const result = await wayInService.getAllWayIn(limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in WayIn getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting all WayIn',
        error: error.message
      });
    }
  }

  // ดึงรายการ VisitType (สำหรับ dropdown)
  async getVisitTypes(req, res) {
    try {
      const result = await wayInService.getVisitTypes();

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in WayIn getVisitTypes:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting visit types',
        error: error.message
      });
    }
  }
}

module.exports = new WayInController();
