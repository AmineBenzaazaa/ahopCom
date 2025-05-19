import { CloseIcon, DeleteIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  DrawerFooter,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react';
import Spinner from 'components/spinner/Spinner';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApi } from 'services/api';
import { HasAccess } from '../../../redux/accessUtils';

const MeetingView = ({ onClose, isOpen, info, access }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [contactAccess, leadAccess] = HasAccess(['Contacts', 'Leads']);

  const fetchViewData = async () => {
    if (!info) return;
    try {
      setIsLoading(true);
      const result = await getApi('api/meeting/view/', info?.event?.id || info);
      setData(result?.data);
    } catch (error) {
      console.error('Failed to fetch meeting view data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchViewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info]);

  const handleViewOpen = () => {
    navigate(`/view/${info?.event?.id || info}`);
  };

  const renderAttendees = () => {
    if (!data?.related) return '-';

    const attendees = data.related === 'Contact' ? data.attendes : data.attendesLead;

    return attendees?.map((item) => {
      const label = data.related === 'Contact' ? `${item.firstName} ${item.lastName}` : item.leadName;
      const path = data.related === 'Contact' ? `/contactView/${item._id}` : `/leadView/${item._id}`;

      if ((data.related === 'Contact' && contactAccess?.view) || (data.related === 'Lead' && leadAccess?.view)) {
        return (
          <Link key={item._id} to={path}>
            <Text color="brand.600" _hover={{ color: 'blue.500', textDecoration: 'underline' }}>{label}</Text>
          </Link>
        );
      }

      return (
        <Text key={item._id} color="blackAlpha.900">{label}</Text>
      );
    }) || '-';
  };

  return (
    <Modal isOpen={isOpen} size='md' isCentered>
      <ModalOverlay />
      <ModalContent maxH="80vh">
        <ModalHeader display='flex' justifyContent='space-between'>
          Meeting
          <IconButton onClick={() => onClose(false)} icon={<CloseIcon />} aria-label="Close" size="sm" />
        </ModalHeader>
        <ModalBody overflowY='auto'>
          {isLoading ? (
            <Flex justifyContent='center' alignItems='center' height='100%'>
              <Spinner />
            </Flex>
          ) : (
            <Grid templateColumns='repeat(12, 1fr)' gap={3}>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Text fontSize='sm' fontWeight='bold'>Agenda</Text>
                <Text>{data?.agenda || '-'}</Text>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Text fontSize='sm' fontWeight='bold'>Date & Time</Text>
                <Text>{data?.dateTime ? moment(data.dateTime).format('lll') : '-'}</Text>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Text fontSize='sm' fontWeight='bold'>Created By</Text>
                <Text>{data?.createdByName || '-'}</Text>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Text fontSize='sm' fontWeight='bold'>Related</Text>
                <Text>{data?.related || '-'}</Text>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Text fontSize='sm' fontWeight='bold'>Location</Text>
                <Text>{data?.location || '-'}</Text>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Text fontSize='sm' fontWeight='bold'>Notes</Text>
                <Text>{data?.notes || '-'}</Text>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Text fontSize='sm' fontWeight='bold'>Attendees</Text>
                {renderAttendees()}
              </GridItem>
            </Grid>
          )}
        </ModalBody>

        <DrawerFooter>
          {access?.view && (
            <IconButton
              variant='outline'
              colorScheme='green'
              onClick={handleViewOpen}
              borderRadius='10px'
              size='md'
              icon={<ViewIcon />}
              aria-label='View Full'
            />
          )}
          {access?.update && (
            <IconButton
              variant='outline'
              ml={3}
              borderRadius='10px'
              size='md'
              icon={<EditIcon />}
              aria-label='Edit'
            />
          )}
          {access?.delete && (
            <IconButton
              colorScheme='red'
              ml={3}
              borderRadius='10px'
              size='md'
              icon={<DeleteIcon />}
              aria-label='Delete'
            />
          )}
        </DrawerFooter>
      </ModalContent>
    </Modal>
  );
};

export default MeetingView;
