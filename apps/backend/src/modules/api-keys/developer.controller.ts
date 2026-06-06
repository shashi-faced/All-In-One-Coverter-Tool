import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Developer')
@Public()
@Controller('developer')
export class DeveloperController {
  @Get('docs')
  @ApiOperation({ summary: 'Get Developer API Documentation details' })
  getDocs() {
    return {
      baseUrl: 'http://187.127.149.22:4000/api/v1',
      authentication: {
        header: 'X-API-Key',
        description: 'Generate an API key in the Developer Portal UI Dashboard, and pass it in the custom request header of all your server-to-server requests.',
        example: 'X-API-Key: cf_live_...'
      },
      endpoints: [
        {
          name: 'Generate API Key via Login Credentials',
          method: 'POST',
          path: '/auth/developer-key',
          description: 'Authenticate with your user credentials to generate or retrieve your active developer API key programmatically.',
          headers: {},
          body: {
            email: 'Required. String. Registered account email address.',
            password: 'Required. String. Account password.'
          },
          response: {
            structure: {
              userId: 'String. The user ID.',
              email: 'String. User email address.',
              name: 'String. User name.',
              apiKey: 'String. The generated/retrieved developer API key.',
              createdAt: 'String. Timestamp when key was created.'
            },
            example: {
              userId: 'usr_abc123',
              email: 'developer@example.com',
              name: 'Jane Developer',
              apiKey: 'cf_cd8e54e43e3e1a7adf90251c501b685d39fb3a6641960d40921d1eb787040048',
              createdAt: '2026-06-04T17:08:19.423Z'
            }
          }
        },
        {
          name: 'Direct File Upload',
          method: 'POST',
          path: '/upload/direct',
          description: 'Upload a file directly as a multipart form payload. Best for standard files (up to 50MB).',
          headers: {
            'X-API-Key': 'Required. Your secret developer API key.'
          },
          bodyType: 'multipart/form-data',
          body: {
            file: 'Required. Binary. The file content to upload.'
          },
          response: {
            structure: {
              id: 'String. The generated unique file ID.',
              originalName: 'String. Original file name.',
              mimeType: 'String. File media mime type.',
              size: 'Number. File size in bytes.',
              format: 'String. File extension format in uppercase.',
              category: 'String. Media classification (e.g. document, image).'
            },
            example: {
              id: 'clw123abc456',
              originalName: 'report.pdf',
              mimeType: 'application/pdf',
              size: 1048576,
              format: 'PDF',
              category: 'document'
            }
          }
        },
        {
          name: 'Initiate Chunked Upload',
          method: 'POST',
          path: '/upload/initiate',
          description: 'Initiate a multi-step upload. Mandatory for files larger than 50MB.',
          headers: {
            'X-API-Key': 'Required. Your secret developer API key.'
          },
          body: {
            fileName: 'Required. String. Name of the file.',
            fileSize: 'Required. Number. Size of the file in bytes.',
            mimeType: 'Required. String. MIME type of the file.'
          },
          response: {
            structure: {
              id: 'String. The generated unique file ID.',
              uploadUrl: 'String. Target URL to PUT the file buffer.'
            },
            example: {
              id: 'clw123abc456',
              uploadUrl: 'http://187.127.149.22:4000/api/v1/storage/download/uploads%2Fclw123abc456-report.pdf'
            }
          }
        },
        {
          name: 'Complete Chunked Upload',
          method: 'POST',
          path: '/upload/complete/{uploadId}',
          description: 'Register chunked upload completion after PUTting the file buffer to the initiate uploadUrl.',
          headers: {
            'X-API-Key': 'Required. Your secret developer API key.'
          },
          params: {
            uploadId: 'Required. String. The upload ID returned from initiate step (same as the file ID).'
          },
          body: {
            fileId: 'Required. String. The unique file ID.'
          },
          response: {
            structure: {
              id: 'String. The unique file ID.',
              status: 'String. Set to UPLOADED.'
            },
            example: {
              id: 'clw123abc456',
              status: 'UPLOADED'
            }
          }
        },
        {
          name: 'Direct Synchronous Conversion',
          method: 'POST',
          path: '/convert/sync',
          description: 'Upload a file and convert it in a single synchronous call. The converted output file is returned directly as the HTTP response payload.',
          headers: {
            'X-API-Key': 'Required. Your secret developer API key.'
          },
          bodyType: 'multipart/form-data',
          body: {
            file: 'Required. Binary. The file content to convert.',
            outputFormat: 'Required. String. Target output format (e.g. "PDF", "PNG", "HTML").',
            options: 'Optional. String. JSON string representation of custom converter options (quality, width, trimStart, etc.).'
          },
          response: {
            description: 'Binary stream representation of the converted output file content.'
          }
        },
        {
          name: 'Trigger Conversion Job',
          method: 'POST',
          path: '/convert',
          description: 'Create an asynchronous conversion job for an uploaded file.',
          headers: {
            'X-API-Key': 'Required. Your secret developer API key.'
          },
          body: {
            fileId: 'Required. String. The unique ID of the uploaded file.',
            outputFormat: 'Required. String. Target output format (e.g. "HTML", "DOCX", "PNG").',
            options: 'Optional. Object. Custom converter options (quality, width, trimStart, etc.).'
          },
          response: {
            structure: {
              id: 'String. The unique conversion job ID.',
              status: 'String. Initial status of the job ("QUEUED").'
            },
            example: {
              id: 'job_xyz789',
              status: 'QUEUED'
            }
          }
        },
        {
          name: 'Query Job Status',
          method: 'GET',
          path: '/convert/{id}',
          description: 'Track the real-time progress, status, and download path of a conversion job.',
          headers: {
            'X-API-Key': 'Required. Your secret developer API key.'
          },
          params: {
            id: 'Required. String. The conversion job ID.'
          },
          response: {
            structure: {
              id: 'String. The conversion job ID.',
              status: 'String. Current status ("PENDING", "QUEUED", "PROCESSING", "COMPLETED", "FAILED").',
              progress: 'Number. Completion percentage (0 to 100).',
              outputPath: 'String. Relative destination path to download the file (only present when status is "COMPLETED").',
              error: 'String. Error detail log message (only present when status is "FAILED").'
            },
            example: {
              id: 'job_xyz789',
              status: 'COMPLETED',
              progress: 100,
              outputPath: 'uploads/job_xyz789-report.html'
            }
          }
        },
        {
          name: 'Download Output File',
          method: 'GET',
          path: '/storage/download/{key}',
          description: 'Download the completed output file by key (the outputPath returned from job query).',
          headers: {
            'X-API-Key': 'Required. Your secret developer API key.'
          },
          params: {
            key: 'Required. String. The outputPath of the completed conversion (e.g. "uploads/job_xyz789-report.html").'
          },
          response: {
            description: 'Binary stream representation of the output file content.'
          }
        }
      ]
    };
  }
}
