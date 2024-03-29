import { useWallet } from "@aptos-labs/wallet-adapter-react";
import React, { useState, useEffect } from "react";
import { Spin } from 'antd';
import { 
  Box,
  Center,
  Stack, 
  Button, 
  Input,
  InputGroup,
  InputRightElement,
  Text,
  List,
  ListItem,
  Heading,
  HStack,
  Link,
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Flex,
  VStack
} from '@chakra-ui/react';
import { MODULE_ADDRESS, PROVIDER } from '../constants';
import { CardItem, CardListFractionalShare } from "./Card/CardListFractionalShare";

export const FractionalShareComponent = () => {
  // Component logic and state can be defined here
  const { account, signAndSubmitTransaction } = useWallet(); 

  type TokenWithAddress = {
    property: string;
    name: string;
    description: string;
    uri: string;
    address: string;
  }

  //
  // State
  //

  /// Fractional Share
  const [accountHasToken, setaccountHasToken] = useState<boolean>(false); //TODO: important for managing property
  const [createdTokens, setCreatedTokens] = useState<TokenWithAddress[]>([]);

  const [newCollectionName, setNewCollectionName] = useState<string>("");
  const [newTokenDescription, setNewTokenDescription] = useState<string>("");
  const [newTokenName, setNewTokenName] = useState<string>("");
  const [newTokenUri, setNewTokenUri] = useState<string>("");

  const [newTokenAddress, setViewTokenAddress] = useState<string>();

  //const [newGetTokenAddress, setNewGetTokenAddress] = useState<string>("");
  const [newCreatedToken, setNewCreatedToken] = useState<string>("");

  // Card Item
  const [fractionalShares, setFractionalShares] = useState<CardItem[]>([]);
  
  /// spinner
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  
  //
  // Effects
  //

  // Fractional Share Token related
  const onCreateCollectionName = (eventCollectionName: React.ChangeEvent<HTMLInputElement>) => {
    const valueCollectionName = eventCollectionName.target.value;
    setNewCollectionName(valueCollectionName);
  };

  const onCreateTokenDescription = (eventTokenDescription: React.ChangeEvent<HTMLInputElement>) => {
    const valueTokenDescription = eventTokenDescription.target.value;
    setNewTokenDescription(valueTokenDescription);
  };

  const onCreateTokenName = (eventTokenName: React.ChangeEvent<HTMLInputElement>) => {
    const valueTokenName = eventTokenName.target.value;
    setNewTokenName(valueTokenName);
  };

  const onCreateTokenUri = (eventTokenUri: React.ChangeEvent<HTMLInputElement>) => {
    const valueTokenUri = eventTokenUri.target.value;
    setNewTokenUri(valueTokenUri);
  };

  /// TODO: Get Property address
  const getTokenAddress = async () => {
    // check for connected account
    if (!account) return;
    setTransactionInProgress(true);
  }

  /// creates a fractional share token
  const onTokenCreated = async () => {
    // check for connected account
    if (!account) return;
    setTransactionInProgress(true);

    // tx payload to be submited
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::property::mint_fractional_share_token`,
      type_arguments: [],
      arguments: [
        newCollectionName,
        newTokenDescription,
        newTokenName,
        newTokenUri,
      ],
    }

    // build new fractional share to push into local state
    const newFractionalShare: CardItem = {
      ownerAddress: account.address,
      propertyName: newCollectionName,
      name: newTokenName,
      description: newTokenDescription,
      uri: newTokenUri,
    }

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(payload);
      // wait for transaction
      await PROVIDER.waitForTransaction(response.hash);

      // set state and add the new fractional share to the array
      setFractionalShares((prevFractionalShares) => [...prevFractionalShares, newFractionalShare]);

      // clear input
      setNewCollectionName("");
      setNewTokenName("");
      setNewTokenDescription("");
      setNewTokenUri("");
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }

    setNewCollectionName("");
    setNewTokenName("");
    setNewTokenDescription("");
    setNewTokenUri("");
  }

    /// Get a Token's address
    const useGetTokenAddress = async () => {
      // check for connected account
      if (!account) return;
      setTransactionInProgress(true);
  

      // creating object with the prompted params
      const newToken = {
        property: newCollectionName,
        name: newTokenName,
        description: newTokenDescription,
        uri: newTokenUri
      }

      const payload = {
        function: `${MODULE_ADDRESS}::property::view_fractional_share_token_address`,
        type_arguments: [],
        arguments: [
          newToken
        ],
      };
      const response = await PROVIDER.view(payload);
      return response[0] as any;
    }
  

  //
  // Render
  //
  return (
    // TSX markup defines the component's UI
    <Spin spinning={transactionInProgress}>
      {/*Fractional Share Token*/}
      <Stack
        w={"95vw"} 
        p={0}
        align={"center"}
      >
        <Center
          w={"42vw"} 
          h={"36vw"}
          overflow={"auto"}
          borderRadius={10}
          borderWidth={2}
          borderColor={"#3f67ff"}
        >
          <Stack>
            {/*COLLECTION NAME*/}
            {/*TODO: Make this a list to choose from */}
            <Input
            pr='4.5rem'
            onChange={(eventCollectionName) => onCreateCollectionName(eventCollectionName)}
            placeholder='Property'
            value={newCollectionName}
            //type={}
            /> 

            {/*TOKEN NAME*/}
            <Input
            pr='4.5rem'
            onChange={(eventCollectionName) => onCreateTokenName(eventCollectionName)}
            placeholder='token name'
            value={newTokenName}
            //type={}
            />

            {/*TOKEN DESCRIPTION*/}
            <Input
            pr='4.5rem'
            onChange={(eventTokenDescription) => onCreateTokenDescription(eventTokenDescription)}
            placeholder='description'
            value={newTokenDescription}
            //type={}
            />          

            {/*URI*/}
            <Input
            pr='4.5rem'
            onChange={(eventTokenUri) => onCreateTokenUri(eventTokenUri)}
            placeholder='uri'
            value={newTokenUri}
            //type={}
            />

            {/* SUBMIT TOKEN*/}          
            <Button
            fontSize={"xx-small"}
            bgColor={"blackAlpha.400"}
            onClick={onTokenCreated}
            >
            Create
            </Button>
          </Stack>
        </Center>

        {/*FRACTIONAL SHARE CARDLIST*/}
        <Center paddingTop={6} >
          <VStack spacing={0}>
            <Heading size='md' textAlign={"center"}>
              My Properties 
            </Heading>
            <Box 
            w={"40vw"} 
            h={"55vw"}
            
            overflow={"auto"}

            transform={`scale(0.8)`}
            >
              <CardListFractionalShare items={fractionalShares} /> 
            </Box>  
          </VStack>   
        </Center>
      </Stack>
      
      {accountHasToken && (
        <Flex flex={8} mx="auto" bgColor={"green"}>
            <Popover>
              <PopoverTrigger>
                <Box>
                  <List>
                    <Heading size='xs'>
                      Fractional Shares list 
                    </Heading>
                    {
                      createdTokens.map((newCreatedTokenToPush) => (
                        <ListItem 
                        key={newCreatedTokenToPush.name}
                        title={newCreatedTokenToPush.name}
                        >
                          <HStack>
                            <Text>
                              {newCreatedTokenToPush.name}
                            </Text>
                            <Link 
                            href={`https://explorer.aptoslabs.com/account/${newCreatedTokenToPush.address}/`}
                            isExternal
                            >
                              view on Explorer
                            </Link>
                          </HStack>
                        </ListItem>
                      ))
                    }
                  </List>
                </Box>
              </PopoverTrigger>
              <PopoverContent bg='orange' color='white'>
                <PopoverHeader fontWeight='semibold'>Register required</PopoverHeader>
                <PopoverCloseButton/>
                <PopoverBody>
                  These fractional shares are not registered yet.
                  You will need to register them before proceeding.
                </PopoverBody>
            </PopoverContent>
            </Popover>
        </Flex>
        
      )}
    </Spin>
  );
};
  
  export default FractionalShareComponent;