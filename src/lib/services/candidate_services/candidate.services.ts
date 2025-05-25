import { API_CONFIG, getApiUrl } from '$lib/services/api';
import type { AvailabilitySchedule, Candidate, CandidateDetailsResponse, Verification } from './candidate.type';

export class CandidateService {
	static async getAllCandidates(): Promise<Candidate[]> {
		try {
			const token = localStorage.getItem('access_token');

			if (!token) {
				console.error('No access token found');
				return [];
			}

			const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CANDIDATES.LIST), {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch candidates');
			}

			const data = await response.json();

			if (data.success && Array.isArray(data.data)) {
				return data.data.map((candidate: any) => ({
					id: candidate.id,
					pronouns: candidate.pronouns,
					title: candidate.title,
					companyName: candidate.company_name,
					firstName: candidate.first_name,
					lastName: candidate.last_name,
					otherName: candidate.other_name,
					companyJobTitle: candidate.company_job_title,
					email: candidate.email,
					userType: candidate.user_type,
					emailVerifiedAt: candidate.email_verified_at,
					phoneNumber: candidate.phone_number,
					address: candidate.address,
					crn: candidate.crn,
					urn: candidate.urn,
					dob: candidate.dob,
					gender: candidate.gender,
					aboutMe: candidate.about_me,
					profilePicture: candidate.profile_picture || null,
					identification: candidate.identification,
					proofOfAddress: candidate.proof_of_address,
					nationalIdentity: candidate.national_identity,
					companyHouseNumber: candidate.company_house_number,
					website: candidate.website,
					lat: candidate.lat,
					postcode: candidate.postcode,
					lng: candidate.lng,
					verified: candidate.verified,
					emailVerified: candidate.email_verified,
					adminVerification: candidate.admin_verification,
					password: candidate.password,
					rememberToken: candidate.remember_token,
					fcmToken: candidate.fcm_token,
					totalJobsPosted: candidate.total_jobs_posted,
					achieved: candidate.achieved,
					createdAt: candidate.created_at,
					updatedAt: candidate.updated_at,
					certificate: candidate.certificate,
					dbsCertificate: candidate.dbs_certificate,
					dbsExpiryDate: candidate.dbs_expiry_date,
					dbsSerialNumber: candidate.dbs_serial_number,
					resumeCv: candidate.resume_cv,
					citizen: candidate.citizen,
					rightToWorkDoc: candidate.right_to_work_doc,
					rightToWork: candidate.right_to_work,
					editedCv: candidate.edited_cv
				}));
			}

			return [];
		} catch (error) {
			console.error('Error fetching candidates:', error);
			return [];
		}
	}

	static async getCandidateById(id: number): Promise<CandidateDetailsResponse | null> {
		try {
			const token = localStorage.getItem('access_token');

			if (!token) {
				console.error('No access token found');
				return null;
			}

			const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CANDIDATES.DETAILS), {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});

			if (!response.ok) {
				throw new Error('Failed to fetch candidate details');
			}

			const data = await response.json();

			if (data.success && data.data) {
				// Map the response data to our TypeScript types
				const responseData = data.data;

				// Map the details object
				const details: Candidate = {
					id: responseData.details.id,
					pronouns: responseData.details.pronouns,
					title: responseData.details.title,
					companyName: responseData.details.company_name,
					firstName: responseData.details.first_name,
					lastName: responseData.details.last_name,
					otherName: responseData.details.other_name,
					companyJobTitle: responseData.details.company_job_title,
					email: responseData.details.email,
					userType: responseData.details.user_type,
					emailVerifiedAt: responseData.details.email_verified_at,
					phoneNumber: responseData.details.phone_number,
					address: responseData.details.address,
					crn: responseData.details.crn,
					urn: responseData.details.urn,
					dob: responseData.details.dob,
					gender: responseData.details.gender,
					aboutMe: responseData.details.about_me,
					profilePicture: responseData.details.profile_picture,
					identification: responseData.details.identification,
					proofOfAddress: responseData.details.proof_of_address,
					nationalIdentity: responseData.details.national_identity,
					companyHouseNumber: responseData.details.company_house_number,
					website: responseData.details.website,
					lat: responseData.details.lat,
					lng: responseData.details.lng,
					postcode: responseData.details.postcode,
					verified: responseData.details.verified,
					emailVerified: responseData.details.email_verified,
					adminVerification: responseData.details.admin_verification,
					password: responseData.details.password,
					rememberToken: responseData.details.remember_token,
					fcmToken: responseData.details.fcm_token,
					totalJobsPosted: responseData.details.total_jobs_posted,
					achieved: responseData.details.achieved,
					createdAt: responseData.details.created_at,
					updatedAt: responseData.details.updated_at,
					certificate: responseData.details.certificate,
					dbsCertificate: responseData.details.dbs_certificate,
					dbsExpiryDate: responseData.details.dbs_expiry_date,
					dbsSerialNumber: responseData.details.dbs_serial_number,
					resumeCv: responseData.details.resume_cv,
					citizen: responseData.details.citizen,
					rightToWorkDoc: responseData.details.right_to_work_doc,
					rightToWork: responseData.details.right_to_work,
					editedCv: responseData.details.edited_cv
				};

				// Map qualifications array
				const qualifications = responseData.qualifications.map((qual: any) => ({
					id: qual.id,
					user_id: qual.user_id,
					qualification_type: qual.qualification_type,
					upload_doc: qual.upload_doc,
					created_at: qual.created_at,
					updated_at: qual.updated_at
				}));

				// Map references array
				const references = responseData.references.map((ref: any) => ({
					id: ref.id,
					type: ref.type,
					doc: ref.doc,
					user_id: ref.user_id
				}));

				// Map other documents array
				const otherDocuments = responseData.other_documents.map((doc: any) => ({
					id: doc.id,
					type: doc.type,
					doc: doc.doc,
					user_id: doc.user_id
				}));

				// Map applied jobs array
				const appliedJobs = responseData.applied_jobs
					? responseData.applied_jobs.map((job: any) => ({
							job_title: job.job_title,
							job_id: job.job_id,
							company_name: job.company_name,
							job_type: job.job_type,
							employment_type: job.employment_type,
							status: job.status,
							interview_invite_link: job.interview_invite_link,
							interview_date: job.interview_date,
							interview_time: job.interview_time,
							interview_by: job.interview_by,
							created_at: job.created_at,
							hours: job.hours,
							days_sessions: job.days_sessions || [],
							tsm: job.tsm || []
						}))
					: [];
                    const availabilitySchedule: AvailabilitySchedule = responseData.availability_schedule || {
                        Monday: [],
                        Tuesday: [],
                        Wednesday: [],
                        Thursday: [],
                        Friday: [],
                        Saturday: [],
                        Sunday: []
                    };
                    const bookings = responseData.bookings ? responseData.bookings.map((booking: any) => ({
                        id: booking.id,
                        company_name: booking.company_name,
                        job_title: booking.job_title,
                        candidate_status: booking.candidate_status,
                        booking_status: booking.booking_status
                    })) : [];
				// Return the properly mapped CandidateDetailsResponse
                return {
                    details,
                    qualifications,
                    references,
                    other_documents: otherDocuments,
                    applied_jobs: appliedJobs,
                    availability_schedule: availabilitySchedule,
                    bookings: bookings
                };
			}

			return null;
		} catch (error) {
			console.error('Error fetching candidate details:', error);
			return null;
		}
	}

	static async verifyCandidate(
		verification: Verification
	): Promise<{ success: boolean; message: string }> {
		try {
			const token = localStorage.getItem('access_token');

			if (!token) {
				return { success: false, message: 'No access token found' };
			}
			const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CANDIDATES.VERIFYCANDIDATE), {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(verification)
			});

			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					message: data.message || 'Failed to verify candidate'
				};
			}

			return {
				success: true,
				message: 'Candidate verification status updated successfully'
			};
		} catch (error) {
			console.error('Error verifying candidate:', error);
			return {
				success: false,
				message: 'An error occurred while updating verification status'
			};
		}
	}
}
