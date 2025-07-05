import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: Course management
 */

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, TeacherId]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               TeacherId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Course created
 */
export const createCourse = async (req, res) => {
    try {
        const course = await db.Course.create(req.body);
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *         description: Sort order
 *       - in: query
 *         name: populate
 *         schema: { type: string }
 *         description: Include related models (e.g., "Teacher,Student")
 *     responses:
 *       200:
 *         description: List of courses
 */
export const getAllCourses = async (req, res) => {
    try {
        // pagination
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        // sorting
        const sort = req.query.sort === 'asc' ? 'ASC' : 'DESC';

        // eager loading
        const populate = req.query.populate;
        let includeOptions = [];

        if(populate) {
            const populateArray = populate.split(',');
            if(populateArray.includes('teacher')){
                includeOptions.push(db.Teacher);
            }
            if(populateArray.includes('student')){
                includeOptions.push(db.Student);
            }
        }

        // get total count for pagination pages
        const total = await db.Course.count();

        const courses = await db.Course.findAll({
            include: includeOptions,
            limit: limit,
            offset: offset,
            order: [['createdAt', sort]]
        })

        res.json({
            meta: {
                totalItems: total,
                page: page,
                totalPages: Math.ceil(total / limit),
                limit: limit,
                sort: sort.toLowerCase()
            },
            data: courses,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: populate
 *         schema: { type: string }
 *         description: Include related models (e.g., "Teacher,Student")
 *     responses:
 *       200:
 *         description: Course found
 *       404:
 *         description: Not found
 */
export const getCourseById = async (req, res) => {
    try {
        // eager loading
        const populate = req.query.populate;
        let includeOptions = [];

        if(populate) {  
            const populateArray = populate.split(',');
            if(populateArray.includes('teacher')){
                includeOptions.push(db.Teacher);
            }
            if(populateArray.includes('student')){
                includeOptions.push(db.Student);
            }
        }

        const course = await db.Course.findByPk(req.params.id, {
            include: includeOptions
        })

        if(!course) return res.status(404).json({ messsage: 'Not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               TeacherId:
 *                type: integer
 *     responses:
 *       200:
 *         description: Course updated
 *       404:
 *         description: Not found
 */
export const updateCourse = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Not found' });
        await course.update(req.body);
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Course deleted
 *       404:
 *         description: Not found
 */ 
export const deleteCourse = async (req, res) => {
    try {
        const course = await db.Course.findByPk(req.params.id);
        if (!course) return res.status(404).json({ message: 'Not found' });
        await course.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
