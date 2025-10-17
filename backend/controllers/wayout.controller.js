const wayOutService = require('../service/wayout.service');

class WayOutController {
  // สร้างข้อมูลการออก
  async create(req, res) {
    try {
      const data = {
        wayInId: req.body.wayInId,
        systemUserId: req.body.systemUserId,
        recordedOn: req.body.recordedOn,
        remarks: req.body.remarks
      };

      // Validate required fields
      if (!data.wayInId) {
        return res.status(400).json({
          success: false,
          message: 'Way In ID is required'
        });
      }

      if (!data.systemUserId) {
        return res.status(400).json({
          success: false,
          message: 'System User ID is required'
        });
      }

      const result = await wayOutService.createWayOut(data);

      res.status(201).json({
        success: true,
        message: 'Way Out record created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in WayOut create:', error);

      // Handle specific error cases
      if (error.message === 'WayIn ID not found') {
        return res.status(404).json({
          success: false,
          message: 'Way In ID not found'
        });
      }

      if (error.message === 'This visitor has already checked out') {
        return res.status(400).json({
          success: false,
          message: 'This visitor has already checked out'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating Way Out record',
        error: error.message
      });
    }
  }

  // ดึงข้อมูลการออกตาม ID
  async getById(req, res) {
    try {
      const id = req.params.id;
      const result = await wayOutService.getWayOutById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Way Out record not found'
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in WayOut getById:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting Way Out record',
        error: error.message
      });
    }
  }

  // ดึงข้อมูลการออกตาม WayIn ID
  async getByWayInId(req, res) {
    try {
      const wayInId = req.params.wayInId;
      const result = await wayOutService.getWayOutByWayInId(wayInId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Way Out record not found for this Way In ID'
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in WayOut getByWayInId:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting Way Out record',
        error: error.message
      });
    }
  }

  // ดึงรายการการออกทั้งหมด
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await wayOutService.getAllWayOut(page, limit);

      res.status(200).json({
        success: true,
        page: page,
        limit: limit,
        count: result.length,
        data: result
      });
    } catch (error) {
      console.error('Error in WayOut getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting Way Out records',
        error: error.message
      });
    }
  }
}

module.exports = new WayOutController();
