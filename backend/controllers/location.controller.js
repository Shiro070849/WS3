const locationService = require('../service/location.service');

class LocationController {
  /**
   * GET /api/locations
   * ดึงรายการ Location ทั้งหมด (with pagination)
   */
  async getAllLocations(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 25;
      const search = req.query.search || '';

      const result = await locationService.getAllLocations(page, limit, search);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error in getAllLocations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get locations'
      });
    }
  }

  /**
   * GET /api/locations/active
   * ดึงรายการ Location ที่ active (สำหรับ dropdown)
   */
  async getActiveLocations(req, res) {
    try {
      const locations = await locationService.getActiveLocations();

      res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      console.error('Error in getActiveLocations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get active locations'
      });
    }
  }

  /**
   * GET /api/locations/:id
   * ดึงข้อมูล Location ตาม ID
   */
  async getLocationById(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location ID'
        });
      }

      const location = await locationService.getLocationById(id);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Location not found'
        });
      }

      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('Error in getLocationById:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get location'
      });
    }
  }

  /**
   * POST /api/locations
   * สร้าง Location ใหม่
   */
  async createLocation(req, res) {
    try {
      const { code, name, description, active } = req.body;
      const userId = req.user?.id || 1; // จาก auth middleware

      // Validation
      if (!code || !name) {
        return res.status(400).json({
          success: false,
          message: 'Location code and name are required'
        });
      }

      const result = await locationService.createLocation({
        code,
        name,
        description,
        active
      }, userId);

      res.status(201).json({
        success: true,
        message: 'Location created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in createLocation:', error);

      if (error.message === 'Location code already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create location'
      });
    }
  }

  /**
   * PUT /api/locations/:id
   * แก้ไขข้อมูล Location
   */
  async updateLocation(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { code, name, description, active } = req.body;
      const userId = req.user?.id || 1; // จาก auth middleware

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location ID'
        });
      }

      // Validation
      if (!code || !name) {
        return res.status(400).json({
          success: false,
          message: 'Location code and name are required'
        });
      }

      // ตรวจสอบว่า Location มีอยู่หรือไม่
      const existing = await locationService.getLocationById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Location not found'
        });
      }

      await locationService.updateLocation(id, {
        code,
        name,
        description,
        active
      }, userId);

      res.json({
        success: true,
        message: 'Location updated successfully'
      });
    } catch (error) {
      console.error('Error in updateLocation:', error);

      if (error.message === 'Location code already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update location'
      });
    }
  }

  /**
   * DELETE /api/locations/:id
   * ลบ Location (soft delete)
   */
  async deleteLocation(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location ID'
        });
      }

      // ตรวจสอบว่า Location มีอยู่หรือไม่
      const existing = await locationService.getLocationById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Location not found'
        });
      }

      await locationService.deleteLocation(id);

      res.json({
        success: true,
        message: 'Location deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteLocation:', error);

      if (error.message.includes('currently in use')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete location'
      });
    }
  }
}

module.exports = new LocationController();
