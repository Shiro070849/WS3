const vehicleService = require('../service/vehicle.service');

class VehicleController {
  /**
   * ดึงรายการรถทั้งหมด พร้อมกรอง
   * Query params: status, search, dateFrom, dateTo, companyId, userId, page, limit
   */
  async getAllVehicles(req, res) {
    try {
      // รับ userId และ filterCompanyId จาก query parameter
      const userId = req.query.userId ? parseInt(req.query.userId) : null;
      const filterCompanyId = req.query.companyId ? parseInt(req.query.companyId) : null;

      // ดึง IC_ID ของ user จาก database
      let userCompanyId = null;
      if (userId) {
        const pool = await require('../service/db.service').connect();
        const userQuery = `SELECT IC_ID FROM [dbo].[SystemUser] WHERE SU_ID = @UserId`;
        const userResult = await pool.request()
          .input('UserId', require('mssql').Int, userId)
          .query(userQuery);
        userCompanyId = userResult.recordset[0]?.IC_ID || null;
      }

      const filters = {
        status: req.query.status || null,
        search: req.query.search || null,
        dateFrom: req.query.dateFrom || null,
        dateTo: req.query.dateTo || null,
        companyId: filterCompanyId,
        userCompanyId: userCompanyId,
      };

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await vehicleService.getAllVehicles(filters, page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error in getAllVehicles:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vehicles',
        error: error.message,
      });
    }
  }

  /**
   * ดึงข้อมูลรถตาม ID
   */
  async getVehicleById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await vehicleService.getVehicleById(id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      console.error('Error in getVehicleById:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vehicle',
        error: error.message,
      });
    }
  }

  /**
   * สร้างรายการรถเข้าใหม่
   */
  async createVehicle(req, res) {
    try {
      const data = {
        licensePlate: req.body.licensePlate,
        licenseProvince: req.body.licenseProvince,
        vehicleType: req.body.vehicleType,
        fullName: req.body.fullName,
        gender: req.body.gender,
        address: req.body.address,
        follower: req.body.follower,
        remarks: req.body.remarks,
        systemUserId: req.body.systemUserId || 1,
        recordedOn: req.body.recordedOn,
        companyId: req.body.companyId,
        departmentId: req.body.departmentId,
        visitTypeId: req.body.visitTypeId,
        fromCompany: req.body.fromCompany,
        contactName: req.body.contactName,
      };

      const result = await vehicleService.createVehicle(data);

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error in createVehicle:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating vehicle',
        error: error.message,
      });
    }
  }

  /**
   * แก้ไขข้อมูลรถ
   */
  async updateVehicle(req, res) {
    try {
      const id = parseInt(req.params.id);
      const data = {
        licensePlate: req.body.licensePlate,
        licenseProvince: req.body.licenseProvince,
        vehicleType: req.body.vehicleType,
        fullName: req.body.fullName,
        gender: req.body.gender,
        address: req.body.address,
        follower: req.body.follower,
        remarks: req.body.remarks,
        companyId: req.body.companyId,
        departmentId: req.body.departmentId,
        visitTypeId: req.body.visitTypeId,
        fromCompany: req.body.fromCompany,
        contactName: req.body.contactName,
      };

      await vehicleService.updateVehicle(id, data);

      res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully',
      });
    } catch (error) {
      console.error('Error in updateVehicle:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating vehicle',
        error: error.message,
      });
    }
  }

  /**
   * ลบรายการรถ
   */
  async deleteVehicle(req, res) {
    try {
      const id = parseInt(req.params.id);
      await vehicleService.deleteVehicle(id);

      res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteVehicle:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting vehicle',
        error: error.message,
      });
    }
  }

  /**
   * บันทึกรถออก (Checkout)
   */
  async checkoutVehicle(req, res) {
    try {
      const wayInId = parseInt(req.params.id);
      const data = {
        systemUserId: req.body.systemUserId || 1,
        recordedOn: req.body.recordedOn,
        remarks: req.body.remarks,
      };

      const result = await vehicleService.checkoutVehicle(wayInId, data);

      res.status(200).json({
        success: true,
        message: 'Vehicle checked out successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error in checkoutVehicle:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error checking out vehicle',
        error: error.message,
      });
    }
  }
}

module.exports = new VehicleController();
